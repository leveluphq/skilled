import { VideoSegment } from 'utils/constants/lesson';

export interface Props {
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  hideTableOfContents?: boolean;
  url?: string | null;
  segments: VideoSegment[];
  changesSinceRecording?: string[];
  uniqueKey: string;
  slug?: string;
}
