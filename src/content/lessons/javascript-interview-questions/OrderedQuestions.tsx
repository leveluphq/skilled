import * as React from 'react';
import { Container } from 'style/elements';

import Ajax from './questions/Ajax';
import AnonFunction from './questions/AnonFunction';
import ArrowFunction from './questions/ArrowFunction';
import BindCallApply from './questions/BindCallApply';
import BoxModel from './questions/BoxModel';
import Closures from './questions/Closures';
import CORS from './questions/CORS';
import DebuggingProcess from './questions/DebuggingProcess';
import DNS from './questions/DNS';
import DOM from './questions/DOM';
import DoubleTripleEquals from './questions/DoubleTripleEquals';
import EventBubbling from './questions/EventBubbling';
import EventDelegation from './questions/EventDelegation';
import EventLoop from './questions/EventLoop';
import ExplainThis from './questions/ExplainThis';
import Frameworks from './questions/Frameworks';
import FunctionTypes from './questions/FunctionTypes';
import GlobalObjectScope from './questions/GlobalObjectScope';
import HigherOrderFunction from './questions/HigherOrderFunction';
import Hoisting from './questions/Hoisting';
import ImmutableHowTo from './questions/ImmutableHowTo';
import ImmutableMutableExplain from './questions/ImmutableMutableExplain';
import MathMax from './questions/MathMax';
import NullUndefinedNotDefined from './questions/NullUndefinedNotDefined';
import Polyfill from './questions/Polyfill';
import PrototypeInherit from './questions/PrototypeInherit';
import ServerClientStaticApps from './questions/ServerClientStaticApps'; // come after SPA questoin
import ShortCircuit from './questions/ShortCircuit';
import SinglePageApp from './questions/SinglePageApp';
import SlowWebsite from './questions/SlowWebsite';
import StrictMode from './questions/StrictMode';
import SyncVsAsync from './questions/SyncVsAsync';
import Ternary from './questions/Ternary';
import TruthyFalsy from './questions/TruthyFalsy';
import VarLetConst from './questions/VarLetConst';

const questions = [
  DoubleTripleEquals,
  ExplainThis,
  BindCallApply,
  VarLetConst,
  TruthyFalsy,
  ArrowFunction,
  Ternary,
  Closures,
  EventLoop,
  AnonFunction,
  PrototypeInherit,
  Hoisting,
  GlobalObjectScope,
  HigherOrderFunction,
  NullUndefinedNotDefined,
  ShortCircuit,
  MathMax,
  FunctionTypes,
  BoxModel,
  Ajax,
  DOM,
  EventBubbling,
  EventDelegation,
  CORS,
  DNS,
  SlowWebsite,
  Frameworks,
  ImmutableMutableExplain,
  ImmutableHowTo,
  SinglePageApp,
  ServerClientStaticApps,
  Polyfill,
  StrictMode,
  SyncVsAsync,
  DebuggingProcess,
];

const OrderedQuestions = () => {
  return (
    <Container>
      {questions.map((Q, i) => (
        <Q key={i} />
      ))}
    </Container>
  );
};

export default OrderedQuestions;
