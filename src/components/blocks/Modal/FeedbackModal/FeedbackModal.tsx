import * as React from 'react';
import Modal from 'components/blocks/Modal';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { Email20 } from '@carbon/icons-react';
import api from 'services/client/api';
import Sentry from 'utils/shared/sentry';
import { SLACK_INVITE_LINK } from 'utils/constants/internal';
import { ModalWidths } from '../Modal';
import { ModalProps } from '../props';

import {
  ModalContent,
  Title,
  EmailWrapper,
  EmailText,
  EmailLink,
  Or,
  FormContainer,
  FieldWrapper,
  Label,
  Input,
  Textarea,
  Button,
  ErrorText,
  SlackWrapper,
  SlackLink,
} from './styles';

const INITIAL_VALUES = {
  name: '',
  email: '',
  feedback: '',
};

const VALIDATION = Yup.object({
  name: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  feedback: Yup.string().required('Add feedback to submit'),
});

interface FieldProps {
  label: string;
  name: string;
  placeholder: string;
  rows?: number;
}

const WiredInput: React.FC<FieldProps> = ({ label, ...props }) => {
  const [field, meta] = useField<string>(props);
  const isError = !!(meta.touched && meta.error);
  return (
    <FieldWrapper>
      <Label htmlFor={props.name}>{label}</Label>
      <Input {...field} {...props} isError={isError} />
      {isError ? <ErrorText>{meta.error}</ErrorText> : null}
    </FieldWrapper>
  );
};

const WiredTextarea: React.FC<FieldProps> = ({ label, ...props }) => {
  const [field, meta] = useField<string>(props);
  const isError = meta.touched && meta.error;

  return (
    <FieldWrapper>
      <Label htmlFor={props.name}>{label}</Label>
      <Textarea {...field} {...props} isError={isError} />
      {isError ? <ErrorText>{meta.error}</ErrorText> : null}
    </FieldWrapper>
  );
};

const FeedbackModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (hasSubmitted && !isSubmitting) {
      onClose();
    }
  }, [hasSubmitted, isSubmitting]);

  return (
    <Modal
      dark
      border
      titleText="Feedback modal"
      width={ModalWidths.Medium}
      onExit={onClose}
      mounted={isOpen}
      focusDialog
      verticallyCenter
    >
      <ModalContent>
        <Title>Feedback and Bug Reports</Title>
        <EmailWrapper>
          <EmailText>Email me:</EmailText>{' '}
          <EmailLink href="mailto:hey@skilled.dev?subject=Skilled.dev feedback">
            <Email20 /> hey@skilled.dev
          </EmailLink>
        </EmailWrapper>
        <SlackWrapper>
          <SlackLink href={SLACK_INVITE_LINK} target="_blank" rel="noopener noreferrer">
            Join our Slack
          </SlackLink>{' '}
          and use the #skilled-dev channel
        </SlackWrapper>
        <Or>OR</Or>
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={VALIDATION}
          onSubmit={(values, { setSubmitting }) => {
            setIsSubmitting(true);
            setHasSubmitted(true);

            const url = window.location.href;

            api
              .post('feedback', {
                payload: { ...values, url },
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
              })
              .then(() => {
                setSubmitting(false);
                setIsSubmitting(false);
              })
              .catch((e) => {
                Sentry.withScope((_scope) => {
                  Sentry.captureException(e);
                });

                alert('There was an error submitting. Email me while we look into the issue');
                setSubmitting(false);
                setIsSubmitting(false);
              });
          }}
        >
          <Form style={{ width: '100%' }}>
            <FormContainer>
              <WiredInput label="Name" name="name" placeholder="Your name" />
              <WiredInput label="Email" name="email" placeholder="youremail@gmail.com" />
              <WiredTextarea
                label="Feedback"
                name="feedback"
                rows={4}
                placeholder="Feedback or bug reports to help us improve Skilled.dev"
              />
              <Button type="submit">Submit Feedback</Button>
            </FormContainer>
          </Form>
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
