import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  timestamptz: any;
  uuid: any;
  numeric: any;
  jsonb: any;
  bigint: any;
};


/** columns and relationships of "affiliate_link_clicks" */
export type Affiliate_Link_Clicks = {
  __typename?: 'affiliate_link_clicks';
  affiliateIdUsed: Scalars['String'];
  /** An object relationship */
  affiliateUser?: Maybe<Users>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt: Scalars['timestamptz'];
  destinationPagePath: Scalars['String'];
  id: Scalars['uuid'];
  ip: Scalars['String'];
  referralUrl: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
};

/** aggregated selection of "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Aggregate = {
  __typename?: 'affiliate_link_clicks_aggregate';
  aggregate?: Maybe<Affiliate_Link_Clicks_Aggregate_Fields>;
  nodes: Array<Affiliate_Link_Clicks>;
};

export type Affiliate_Link_Clicks_Aggregate_Bool_Exp = {
  count?: Maybe<Affiliate_Link_Clicks_Aggregate_Bool_Exp_Count>;
};

export type Affiliate_Link_Clicks_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Aggregate_Fields = {
  __typename?: 'affiliate_link_clicks_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Affiliate_Link_Clicks_Max_Fields>;
  min?: Maybe<Affiliate_Link_Clicks_Min_Fields>;
};


/** aggregate fields of "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Aggregate_Order_By = {
  count?: Maybe<Order_By>;
  max?: Maybe<Affiliate_Link_Clicks_Max_Order_By>;
  min?: Maybe<Affiliate_Link_Clicks_Min_Order_By>;
};

/** input type for inserting array relation for remote table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Arr_Rel_Insert_Input = {
  data: Array<Affiliate_Link_Clicks_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Affiliate_Link_Clicks_On_Conflict>;
};

/** Boolean expression to filter rows from the table "affiliate_link_clicks". All fields are combined with a logical 'AND'. */
export type Affiliate_Link_Clicks_Bool_Exp = {
  _and?: Maybe<Array<Affiliate_Link_Clicks_Bool_Exp>>;
  _not?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
  _or?: Maybe<Array<Affiliate_Link_Clicks_Bool_Exp>>;
  affiliateIdUsed?: Maybe<String_Comparison_Exp>;
  affiliateUser?: Maybe<Users_Bool_Exp>;
  affiliateUserId?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  destinationPagePath?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  ip?: Maybe<String_Comparison_Exp>;
  referralUrl?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "affiliate_link_clicks" */
export enum Affiliate_Link_Clicks_Constraint {
  /** unique or primary key constraint on columns "id" */
  AffiliateLinkClicksPkey = 'affiliate_link_clicks_pkey'
}

/** input type for inserting data into table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Insert_Input = {
  affiliateIdUsed?: Maybe<Scalars['String']>;
  affiliateUser?: Maybe<Users_Obj_Rel_Insert_Input>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  destinationPagePath?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  referralUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Affiliate_Link_Clicks_Max_Fields = {
  __typename?: 'affiliate_link_clicks_max_fields';
  affiliateIdUsed?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  destinationPagePath?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  referralUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Max_Order_By = {
  affiliateIdUsed?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  destinationPagePath?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Affiliate_Link_Clicks_Min_Fields = {
  __typename?: 'affiliate_link_clicks_min_fields';
  affiliateIdUsed?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  destinationPagePath?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  referralUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Min_Order_By = {
  affiliateIdUsed?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  destinationPagePath?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** response of any mutation on the table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Mutation_Response = {
  __typename?: 'affiliate_link_clicks_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Affiliate_Link_Clicks>;
};

/** input type for inserting object relation for remote table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Obj_Rel_Insert_Input = {
  data: Affiliate_Link_Clicks_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Affiliate_Link_Clicks_On_Conflict>;
};

/** on_conflict condition type for table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_On_Conflict = {
  constraint: Affiliate_Link_Clicks_Constraint;
  update_columns: Array<Affiliate_Link_Clicks_Update_Column>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};

/** Ordering options when selecting data from "affiliate_link_clicks". */
export type Affiliate_Link_Clicks_Order_By = {
  affiliateIdUsed?: Maybe<Order_By>;
  affiliateUser?: Maybe<Users_Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  destinationPagePath?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** primary key columns input for table: affiliate_link_clicks */
export type Affiliate_Link_Clicks_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "affiliate_link_clicks" */
export enum Affiliate_Link_Clicks_Select_Column {
  /** column name */
  AffiliateIdUsed = 'affiliateIdUsed',
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DestinationPagePath = 'destinationPagePath',
  /** column name */
  Id = 'id',
  /** column name */
  Ip = 'ip',
  /** column name */
  ReferralUrl = 'referralUrl',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Set_Input = {
  affiliateIdUsed?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  destinationPagePath?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  referralUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** Streaming cursor of the table "affiliate_link_clicks" */
export type Affiliate_Link_Clicks_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Affiliate_Link_Clicks_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Affiliate_Link_Clicks_Stream_Cursor_Value_Input = {
  affiliateIdUsed?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  destinationPagePath?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  referralUrl?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "affiliate_link_clicks" */
export enum Affiliate_Link_Clicks_Update_Column {
  /** column name */
  AffiliateIdUsed = 'affiliateIdUsed',
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DestinationPagePath = 'destinationPagePath',
  /** column name */
  Id = 'id',
  /** column name */
  Ip = 'ip',
  /** column name */
  ReferralUrl = 'referralUrl',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Affiliate_Link_Clicks_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Affiliate_Link_Clicks_Set_Input>;
  /** filter the rows which have to be updated */
  where: Affiliate_Link_Clicks_Bool_Exp;
};

/** columns and relationships of "affiliate_payouts" */
export type Affiliate_Payouts = {
  __typename?: 'affiliate_payouts';
  affiliateUserId: Scalars['String'];
  amount: Scalars['numeric'];
  createdAt: Scalars['timestamptz'];
  id: Scalars['uuid'];
  month: Scalars['Int'];
  /** An array relationship */
  sales: Array<Sales>;
  /** An aggregate relationship */
  sales_aggregate: Sales_Aggregate;
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  year: Scalars['Int'];
};


/** columns and relationships of "affiliate_payouts" */
export type Affiliate_PayoutsSalesArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


/** columns and relationships of "affiliate_payouts" */
export type Affiliate_PayoutsSales_AggregateArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};

/** aggregated selection of "affiliate_payouts" */
export type Affiliate_Payouts_Aggregate = {
  __typename?: 'affiliate_payouts_aggregate';
  aggregate?: Maybe<Affiliate_Payouts_Aggregate_Fields>;
  nodes: Array<Affiliate_Payouts>;
};

export type Affiliate_Payouts_Aggregate_Bool_Exp = {
  count?: Maybe<Affiliate_Payouts_Aggregate_Bool_Exp_Count>;
};

export type Affiliate_Payouts_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Affiliate_Payouts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "affiliate_payouts" */
export type Affiliate_Payouts_Aggregate_Fields = {
  __typename?: 'affiliate_payouts_aggregate_fields';
  avg?: Maybe<Affiliate_Payouts_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Affiliate_Payouts_Max_Fields>;
  min?: Maybe<Affiliate_Payouts_Min_Fields>;
  stddev?: Maybe<Affiliate_Payouts_Stddev_Fields>;
  stddev_pop?: Maybe<Affiliate_Payouts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Affiliate_Payouts_Stddev_Samp_Fields>;
  sum?: Maybe<Affiliate_Payouts_Sum_Fields>;
  var_pop?: Maybe<Affiliate_Payouts_Var_Pop_Fields>;
  var_samp?: Maybe<Affiliate_Payouts_Var_Samp_Fields>;
  variance?: Maybe<Affiliate_Payouts_Variance_Fields>;
};


/** aggregate fields of "affiliate_payouts" */
export type Affiliate_Payouts_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "affiliate_payouts" */
export type Affiliate_Payouts_Aggregate_Order_By = {
  avg?: Maybe<Affiliate_Payouts_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Affiliate_Payouts_Max_Order_By>;
  min?: Maybe<Affiliate_Payouts_Min_Order_By>;
  stddev?: Maybe<Affiliate_Payouts_Stddev_Order_By>;
  stddev_pop?: Maybe<Affiliate_Payouts_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Affiliate_Payouts_Stddev_Samp_Order_By>;
  sum?: Maybe<Affiliate_Payouts_Sum_Order_By>;
  var_pop?: Maybe<Affiliate_Payouts_Var_Pop_Order_By>;
  var_samp?: Maybe<Affiliate_Payouts_Var_Samp_Order_By>;
  variance?: Maybe<Affiliate_Payouts_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "affiliate_payouts" */
export type Affiliate_Payouts_Arr_Rel_Insert_Input = {
  data: Array<Affiliate_Payouts_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Affiliate_Payouts_On_Conflict>;
};

/** aggregate avg on columns */
export type Affiliate_Payouts_Avg_Fields = {
  __typename?: 'affiliate_payouts_avg_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Avg_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "affiliate_payouts". All fields are combined with a logical 'AND'. */
export type Affiliate_Payouts_Bool_Exp = {
  _and?: Maybe<Array<Affiliate_Payouts_Bool_Exp>>;
  _not?: Maybe<Affiliate_Payouts_Bool_Exp>;
  _or?: Maybe<Array<Affiliate_Payouts_Bool_Exp>>;
  affiliateUserId?: Maybe<String_Comparison_Exp>;
  amount?: Maybe<Numeric_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  month?: Maybe<Int_Comparison_Exp>;
  sales?: Maybe<Sales_Bool_Exp>;
  sales_aggregate?: Maybe<Sales_Aggregate_Bool_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  year?: Maybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "affiliate_payouts" */
export enum Affiliate_Payouts_Constraint {
  /** unique or primary key constraint on columns "id" */
  AffiliatePayoutsPkey = 'affiliate_payouts_pkey'
}

/** input type for incrementing numeric columns in table "affiliate_payouts" */
export type Affiliate_Payouts_Inc_Input = {
  amount?: Maybe<Scalars['numeric']>;
  month?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "affiliate_payouts" */
export type Affiliate_Payouts_Insert_Input = {
  affiliateUserId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  month?: Maybe<Scalars['Int']>;
  sales?: Maybe<Sales_Arr_Rel_Insert_Input>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  year?: Maybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Affiliate_Payouts_Max_Fields = {
  __typename?: 'affiliate_payouts_max_fields';
  affiliateUserId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  month?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  year?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Max_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  amount?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Affiliate_Payouts_Min_Fields = {
  __typename?: 'affiliate_payouts_min_fields';
  affiliateUserId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  month?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  year?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Min_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  amount?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** response of any mutation on the table "affiliate_payouts" */
export type Affiliate_Payouts_Mutation_Response = {
  __typename?: 'affiliate_payouts_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Affiliate_Payouts>;
};

/** input type for inserting object relation for remote table "affiliate_payouts" */
export type Affiliate_Payouts_Obj_Rel_Insert_Input = {
  data: Affiliate_Payouts_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Affiliate_Payouts_On_Conflict>;
};

/** on_conflict condition type for table "affiliate_payouts" */
export type Affiliate_Payouts_On_Conflict = {
  constraint: Affiliate_Payouts_Constraint;
  update_columns: Array<Affiliate_Payouts_Update_Column>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};

/** Ordering options when selecting data from "affiliate_payouts". */
export type Affiliate_Payouts_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  amount?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  sales_aggregate?: Maybe<Sales_Aggregate_Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  year?: Maybe<Order_By>;
};

/** primary key columns input for table: affiliate_payouts */
export type Affiliate_Payouts_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "affiliate_payouts" */
export enum Affiliate_Payouts_Select_Column {
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  Amount = 'amount',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Month = 'month',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Year = 'year'
}

/** input type for updating data in table "affiliate_payouts" */
export type Affiliate_Payouts_Set_Input = {
  affiliateUserId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  month?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  year?: Maybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Affiliate_Payouts_Stddev_Fields = {
  __typename?: 'affiliate_payouts_stddev_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Stddev_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Affiliate_Payouts_Stddev_Pop_Fields = {
  __typename?: 'affiliate_payouts_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Stddev_Pop_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Affiliate_Payouts_Stddev_Samp_Fields = {
  __typename?: 'affiliate_payouts_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Stddev_Samp_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** Streaming cursor of the table "affiliate_payouts" */
export type Affiliate_Payouts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Affiliate_Payouts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Affiliate_Payouts_Stream_Cursor_Value_Input = {
  affiliateUserId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  month?: Maybe<Scalars['Int']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  year?: Maybe<Scalars['Int']>;
};

/** aggregate sum on columns */
export type Affiliate_Payouts_Sum_Fields = {
  __typename?: 'affiliate_payouts_sum_fields';
  amount?: Maybe<Scalars['numeric']>;
  month?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Sum_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** update columns of table "affiliate_payouts" */
export enum Affiliate_Payouts_Update_Column {
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  Amount = 'amount',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Month = 'month',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Year = 'year'
}

export type Affiliate_Payouts_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Affiliate_Payouts_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Affiliate_Payouts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Affiliate_Payouts_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Affiliate_Payouts_Var_Pop_Fields = {
  __typename?: 'affiliate_payouts_var_pop_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Var_Pop_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Affiliate_Payouts_Var_Samp_Fields = {
  __typename?: 'affiliate_payouts_var_samp_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Var_Samp_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Affiliate_Payouts_Variance_Fields = {
  __typename?: 'affiliate_payouts_variance_fields';
  amount?: Maybe<Scalars['Float']>;
  month?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "affiliate_payouts" */
export type Affiliate_Payouts_Variance_Order_By = {
  amount?: Maybe<Order_By>;
  month?: Maybe<Order_By>;
  year?: Maybe<Order_By>;
};

/** columns and relationships of "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts = {
  __typename?: 'affiliate_referral_click_counts';
  affiliateUserId?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['bigint']>;
  mostRecentDate?: Maybe<Scalars['timestamptz']>;
  referralUrl?: Maybe<Scalars['String']>;
};

/** aggregated selection of "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Aggregate = {
  __typename?: 'affiliate_referral_click_counts_aggregate';
  aggregate?: Maybe<Affiliate_Referral_Click_Counts_Aggregate_Fields>;
  nodes: Array<Affiliate_Referral_Click_Counts>;
};

export type Affiliate_Referral_Click_Counts_Aggregate_Bool_Exp = {
  count?: Maybe<Affiliate_Referral_Click_Counts_Aggregate_Bool_Exp_Count>;
};

export type Affiliate_Referral_Click_Counts_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Aggregate_Fields = {
  __typename?: 'affiliate_referral_click_counts_aggregate_fields';
  avg?: Maybe<Affiliate_Referral_Click_Counts_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Affiliate_Referral_Click_Counts_Max_Fields>;
  min?: Maybe<Affiliate_Referral_Click_Counts_Min_Fields>;
  stddev?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Fields>;
  stddev_pop?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Samp_Fields>;
  sum?: Maybe<Affiliate_Referral_Click_Counts_Sum_Fields>;
  var_pop?: Maybe<Affiliate_Referral_Click_Counts_Var_Pop_Fields>;
  var_samp?: Maybe<Affiliate_Referral_Click_Counts_Var_Samp_Fields>;
  variance?: Maybe<Affiliate_Referral_Click_Counts_Variance_Fields>;
};


/** aggregate fields of "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Aggregate_Order_By = {
  avg?: Maybe<Affiliate_Referral_Click_Counts_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Affiliate_Referral_Click_Counts_Max_Order_By>;
  min?: Maybe<Affiliate_Referral_Click_Counts_Min_Order_By>;
  stddev?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Order_By>;
  stddev_pop?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Affiliate_Referral_Click_Counts_Stddev_Samp_Order_By>;
  sum?: Maybe<Affiliate_Referral_Click_Counts_Sum_Order_By>;
  var_pop?: Maybe<Affiliate_Referral_Click_Counts_Var_Pop_Order_By>;
  var_samp?: Maybe<Affiliate_Referral_Click_Counts_Var_Samp_Order_By>;
  variance?: Maybe<Affiliate_Referral_Click_Counts_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Arr_Rel_Insert_Input = {
  data: Array<Affiliate_Referral_Click_Counts_Insert_Input>;
};

/** aggregate avg on columns */
export type Affiliate_Referral_Click_Counts_Avg_Fields = {
  __typename?: 'affiliate_referral_click_counts_avg_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Avg_Order_By = {
  count?: Maybe<Order_By>;
};

/**
 * Boolean expression to filter rows from the table
 * "affiliate_referral_click_counts". All fields are combined with a logical 'AND'.
 */
export type Affiliate_Referral_Click_Counts_Bool_Exp = {
  _and?: Maybe<Array<Affiliate_Referral_Click_Counts_Bool_Exp>>;
  _not?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
  _or?: Maybe<Array<Affiliate_Referral_Click_Counts_Bool_Exp>>;
  affiliateUserId?: Maybe<String_Comparison_Exp>;
  count?: Maybe<Bigint_Comparison_Exp>;
  mostRecentDate?: Maybe<Timestamptz_Comparison_Exp>;
  referralUrl?: Maybe<String_Comparison_Exp>;
};

/** input type for inserting data into table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Insert_Input = {
  affiliateUserId?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['bigint']>;
  mostRecentDate?: Maybe<Scalars['timestamptz']>;
  referralUrl?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Affiliate_Referral_Click_Counts_Max_Fields = {
  __typename?: 'affiliate_referral_click_counts_max_fields';
  affiliateUserId?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['bigint']>;
  mostRecentDate?: Maybe<Scalars['timestamptz']>;
  referralUrl?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Max_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  count?: Maybe<Order_By>;
  mostRecentDate?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Affiliate_Referral_Click_Counts_Min_Fields = {
  __typename?: 'affiliate_referral_click_counts_min_fields';
  affiliateUserId?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['bigint']>;
  mostRecentDate?: Maybe<Scalars['timestamptz']>;
  referralUrl?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Min_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  count?: Maybe<Order_By>;
  mostRecentDate?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
};

/** Ordering options when selecting data from "affiliate_referral_click_counts". */
export type Affiliate_Referral_Click_Counts_Order_By = {
  affiliateUserId?: Maybe<Order_By>;
  count?: Maybe<Order_By>;
  mostRecentDate?: Maybe<Order_By>;
  referralUrl?: Maybe<Order_By>;
};

/** select columns of table "affiliate_referral_click_counts" */
export enum Affiliate_Referral_Click_Counts_Select_Column {
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  Count = 'count',
  /** column name */
  MostRecentDate = 'mostRecentDate',
  /** column name */
  ReferralUrl = 'referralUrl'
}

/** aggregate stddev on columns */
export type Affiliate_Referral_Click_Counts_Stddev_Fields = {
  __typename?: 'affiliate_referral_click_counts_stddev_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Stddev_Order_By = {
  count?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Affiliate_Referral_Click_Counts_Stddev_Pop_Fields = {
  __typename?: 'affiliate_referral_click_counts_stddev_pop_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Stddev_Pop_Order_By = {
  count?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Affiliate_Referral_Click_Counts_Stddev_Samp_Fields = {
  __typename?: 'affiliate_referral_click_counts_stddev_samp_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Stddev_Samp_Order_By = {
  count?: Maybe<Order_By>;
};

/** Streaming cursor of the table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Affiliate_Referral_Click_Counts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Affiliate_Referral_Click_Counts_Stream_Cursor_Value_Input = {
  affiliateUserId?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['bigint']>;
  mostRecentDate?: Maybe<Scalars['timestamptz']>;
  referralUrl?: Maybe<Scalars['String']>;
};

/** aggregate sum on columns */
export type Affiliate_Referral_Click_Counts_Sum_Fields = {
  __typename?: 'affiliate_referral_click_counts_sum_fields';
  count?: Maybe<Scalars['bigint']>;
};

/** order by sum() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Sum_Order_By = {
  count?: Maybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Affiliate_Referral_Click_Counts_Var_Pop_Fields = {
  __typename?: 'affiliate_referral_click_counts_var_pop_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Var_Pop_Order_By = {
  count?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Affiliate_Referral_Click_Counts_Var_Samp_Fields = {
  __typename?: 'affiliate_referral_click_counts_var_samp_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Var_Samp_Order_By = {
  count?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Affiliate_Referral_Click_Counts_Variance_Fields = {
  __typename?: 'affiliate_referral_click_counts_variance_fields';
  count?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "affiliate_referral_click_counts" */
export type Affiliate_Referral_Click_Counts_Variance_Order_By = {
  count?: Maybe<Order_By>;
};

/** columns and relationships of "affiliate_sales" */
export type Affiliate_Sales = {
  __typename?: 'affiliate_sales';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregated selection of "affiliate_sales" */
export type Affiliate_Sales_Aggregate = {
  __typename?: 'affiliate_sales_aggregate';
  aggregate?: Maybe<Affiliate_Sales_Aggregate_Fields>;
  nodes: Array<Affiliate_Sales>;
};

export type Affiliate_Sales_Aggregate_Bool_Exp = {
  count?: Maybe<Affiliate_Sales_Aggregate_Bool_Exp_Count>;
};

export type Affiliate_Sales_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Affiliate_Sales_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "affiliate_sales" */
export type Affiliate_Sales_Aggregate_Fields = {
  __typename?: 'affiliate_sales_aggregate_fields';
  avg?: Maybe<Affiliate_Sales_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Affiliate_Sales_Max_Fields>;
  min?: Maybe<Affiliate_Sales_Min_Fields>;
  stddev?: Maybe<Affiliate_Sales_Stddev_Fields>;
  stddev_pop?: Maybe<Affiliate_Sales_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Affiliate_Sales_Stddev_Samp_Fields>;
  sum?: Maybe<Affiliate_Sales_Sum_Fields>;
  var_pop?: Maybe<Affiliate_Sales_Var_Pop_Fields>;
  var_samp?: Maybe<Affiliate_Sales_Var_Samp_Fields>;
  variance?: Maybe<Affiliate_Sales_Variance_Fields>;
};


/** aggregate fields of "affiliate_sales" */
export type Affiliate_Sales_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "affiliate_sales" */
export type Affiliate_Sales_Aggregate_Order_By = {
  avg?: Maybe<Affiliate_Sales_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Affiliate_Sales_Max_Order_By>;
  min?: Maybe<Affiliate_Sales_Min_Order_By>;
  stddev?: Maybe<Affiliate_Sales_Stddev_Order_By>;
  stddev_pop?: Maybe<Affiliate_Sales_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Affiliate_Sales_Stddev_Samp_Order_By>;
  sum?: Maybe<Affiliate_Sales_Sum_Order_By>;
  var_pop?: Maybe<Affiliate_Sales_Var_Pop_Order_By>;
  var_samp?: Maybe<Affiliate_Sales_Var_Samp_Order_By>;
  variance?: Maybe<Affiliate_Sales_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "affiliate_sales" */
export type Affiliate_Sales_Arr_Rel_Insert_Input = {
  data: Array<Affiliate_Sales_Insert_Input>;
};

/** aggregate avg on columns */
export type Affiliate_Sales_Avg_Fields = {
  __typename?: 'affiliate_sales_avg_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Avg_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "affiliate_sales". All fields are combined with a logical 'AND'. */
export type Affiliate_Sales_Bool_Exp = {
  _and?: Maybe<Array<Affiliate_Sales_Bool_Exp>>;
  _not?: Maybe<Affiliate_Sales_Bool_Exp>;
  _or?: Maybe<Array<Affiliate_Sales_Bool_Exp>>;
  affiliateAmountEarned?: Maybe<Numeric_Comparison_Exp>;
  affiliateUserId?: Maybe<String_Comparison_Exp>;
  amountPaid?: Maybe<Numeric_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "affiliate_sales" */
export type Affiliate_Sales_Inc_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  amountPaid?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "affiliate_sales" */
export type Affiliate_Sales_Insert_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Affiliate_Sales_Max_Fields = {
  __typename?: 'affiliate_sales_max_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Max_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Affiliate_Sales_Min_Fields = {
  __typename?: 'affiliate_sales_min_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Min_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** response of any mutation on the table "affiliate_sales" */
export type Affiliate_Sales_Mutation_Response = {
  __typename?: 'affiliate_sales_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Affiliate_Sales>;
};

/** Ordering options when selecting data from "affiliate_sales". */
export type Affiliate_Sales_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** select columns of table "affiliate_sales" */
export enum Affiliate_Sales_Select_Column {
  /** column name */
  AffiliateAmountEarned = 'affiliateAmountEarned',
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  AmountPaid = 'amountPaid',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "affiliate_sales" */
export type Affiliate_Sales_Set_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Affiliate_Sales_Stddev_Fields = {
  __typename?: 'affiliate_sales_stddev_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Stddev_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Affiliate_Sales_Stddev_Pop_Fields = {
  __typename?: 'affiliate_sales_stddev_pop_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Stddev_Pop_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Affiliate_Sales_Stddev_Samp_Fields = {
  __typename?: 'affiliate_sales_stddev_samp_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Stddev_Samp_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** Streaming cursor of the table "affiliate_sales" */
export type Affiliate_Sales_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Affiliate_Sales_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Affiliate_Sales_Stream_Cursor_Value_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate sum on columns */
export type Affiliate_Sales_Sum_Fields = {
  __typename?: 'affiliate_sales_sum_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  amountPaid?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Sum_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

export type Affiliate_Sales_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Affiliate_Sales_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Affiliate_Sales_Set_Input>;
  /** filter the rows which have to be updated */
  where: Affiliate_Sales_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Affiliate_Sales_Var_Pop_Fields = {
  __typename?: 'affiliate_sales_var_pop_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Var_Pop_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Affiliate_Sales_Var_Samp_Fields = {
  __typename?: 'affiliate_sales_var_samp_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Var_Samp_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Affiliate_Sales_Variance_Fields = {
  __typename?: 'affiliate_sales_variance_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "affiliate_sales" */
export type Affiliate_Sales_Variance_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
};

/** columns and relationships of "alternate_emails" */
export type Alternate_Emails = {
  __typename?: 'alternate_emails';
  createdAt: Scalars['timestamptz'];
  email: Scalars['String'];
  id: Scalars['uuid'];
  source: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  userId: Scalars['String'];
};

/** aggregated selection of "alternate_emails" */
export type Alternate_Emails_Aggregate = {
  __typename?: 'alternate_emails_aggregate';
  aggregate?: Maybe<Alternate_Emails_Aggregate_Fields>;
  nodes: Array<Alternate_Emails>;
};

export type Alternate_Emails_Aggregate_Bool_Exp = {
  count?: Maybe<Alternate_Emails_Aggregate_Bool_Exp_Count>;
};

export type Alternate_Emails_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Alternate_Emails_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Alternate_Emails_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "alternate_emails" */
export type Alternate_Emails_Aggregate_Fields = {
  __typename?: 'alternate_emails_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Alternate_Emails_Max_Fields>;
  min?: Maybe<Alternate_Emails_Min_Fields>;
};


/** aggregate fields of "alternate_emails" */
export type Alternate_Emails_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Alternate_Emails_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "alternate_emails" */
export type Alternate_Emails_Aggregate_Order_By = {
  count?: Maybe<Order_By>;
  max?: Maybe<Alternate_Emails_Max_Order_By>;
  min?: Maybe<Alternate_Emails_Min_Order_By>;
};

/** input type for inserting array relation for remote table "alternate_emails" */
export type Alternate_Emails_Arr_Rel_Insert_Input = {
  data: Array<Alternate_Emails_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Alternate_Emails_On_Conflict>;
};

/** Boolean expression to filter rows from the table "alternate_emails". All fields are combined with a logical 'AND'. */
export type Alternate_Emails_Bool_Exp = {
  _and?: Maybe<Array<Alternate_Emails_Bool_Exp>>;
  _not?: Maybe<Alternate_Emails_Bool_Exp>;
  _or?: Maybe<Array<Alternate_Emails_Bool_Exp>>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  email?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  source?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "alternate_emails" */
export enum Alternate_Emails_Constraint {
  /** unique or primary key constraint on columns "id" */
  AlternateEmailsPkey = 'alternate_emails_pkey',
  /** unique or primary key constraint on columns "userId", "email" */
  AlternateEmailsUserIdEmailKey = 'alternate_emails_userId_email_key'
}

/** input type for inserting data into table "alternate_emails" */
export type Alternate_Emails_Insert_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  source?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Alternate_Emails_Max_Fields = {
  __typename?: 'alternate_emails_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  source?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "alternate_emails" */
export type Alternate_Emails_Max_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Alternate_Emails_Min_Fields = {
  __typename?: 'alternate_emails_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  source?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "alternate_emails" */
export type Alternate_Emails_Min_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** response of any mutation on the table "alternate_emails" */
export type Alternate_Emails_Mutation_Response = {
  __typename?: 'alternate_emails_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Alternate_Emails>;
};

/** on_conflict condition type for table "alternate_emails" */
export type Alternate_Emails_On_Conflict = {
  constraint: Alternate_Emails_Constraint;
  update_columns: Array<Alternate_Emails_Update_Column>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};

/** Ordering options when selecting data from "alternate_emails". */
export type Alternate_Emails_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
};

/** primary key columns input for table: alternate_emails */
export type Alternate_Emails_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "alternate_emails" */
export enum Alternate_Emails_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Source = 'source',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "alternate_emails" */
export type Alternate_Emails_Set_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  source?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** Streaming cursor of the table "alternate_emails" */
export type Alternate_Emails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Alternate_Emails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Alternate_Emails_Stream_Cursor_Value_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  source?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** update columns of table "alternate_emails" */
export enum Alternate_Emails_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Source = 'source',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

export type Alternate_Emails_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Alternate_Emails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Alternate_Emails_Bool_Exp;
};


/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: Maybe<Scalars['bigint']>;
  _gt?: Maybe<Scalars['bigint']>;
  _gte?: Maybe<Scalars['bigint']>;
  _in?: Maybe<Array<Scalars['bigint']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['bigint']>;
  _lte?: Maybe<Scalars['bigint']>;
  _neq?: Maybe<Scalars['bigint']>;
  _nin?: Maybe<Array<Scalars['bigint']>>;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: Maybe<Scalars['Boolean']>;
  _gt?: Maybe<Scalars['Boolean']>;
  _gte?: Maybe<Scalars['Boolean']>;
  _in?: Maybe<Array<Scalars['Boolean']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Boolean']>;
  _lte?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<Scalars['Boolean']>;
  _nin?: Maybe<Array<Scalars['Boolean']>>;
};

/** columns and relationships of "categories" */
export type Categories = {
  __typename?: 'categories';
  createdAt: Scalars['timestamptz'];
  description: Scalars['String'];
  id: Scalars['uuid'];
  /** An array relationship */
  lessons: Array<Lessons>;
  /** An aggregate relationship */
  lessons_aggregate: Lessons_Aggregate;
  position: Scalars['Int'];
  previewVideo: Scalars['String'];
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  video: Scalars['String'];
};


/** columns and relationships of "categories" */
export type CategoriesLessonsArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


/** columns and relationships of "categories" */
export type CategoriesLessons_AggregateArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};

/** aggregated selection of "categories" */
export type Categories_Aggregate = {
  __typename?: 'categories_aggregate';
  aggregate?: Maybe<Categories_Aggregate_Fields>;
  nodes: Array<Categories>;
};

/** aggregate fields of "categories" */
export type Categories_Aggregate_Fields = {
  __typename?: 'categories_aggregate_fields';
  avg?: Maybe<Categories_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Categories_Max_Fields>;
  min?: Maybe<Categories_Min_Fields>;
  stddev?: Maybe<Categories_Stddev_Fields>;
  stddev_pop?: Maybe<Categories_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Categories_Stddev_Samp_Fields>;
  sum?: Maybe<Categories_Sum_Fields>;
  var_pop?: Maybe<Categories_Var_Pop_Fields>;
  var_samp?: Maybe<Categories_Var_Samp_Fields>;
  variance?: Maybe<Categories_Variance_Fields>;
};


/** aggregate fields of "categories" */
export type Categories_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Categories_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Categories_Avg_Fields = {
  __typename?: 'categories_avg_fields';
  position?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "categories". All fields are combined with a logical 'AND'. */
export type Categories_Bool_Exp = {
  _and?: Maybe<Array<Categories_Bool_Exp>>;
  _not?: Maybe<Categories_Bool_Exp>;
  _or?: Maybe<Array<Categories_Bool_Exp>>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  description?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  lessons?: Maybe<Lessons_Bool_Exp>;
  lessons_aggregate?: Maybe<Lessons_Aggregate_Bool_Exp>;
  position?: Maybe<Int_Comparison_Exp>;
  previewVideo?: Maybe<String_Comparison_Exp>;
  slug?: Maybe<String_Comparison_Exp>;
  title?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  video?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "categories" */
export enum Categories_Constraint {
  /** unique or primary key constraint on columns "id" */
  CategoriesPkey = 'categories_pkey',
  /** unique or primary key constraint on columns "position" */
  CategoriesPositionKey = 'categories_position_key',
  /** unique or primary key constraint on columns "slug" */
  CategoriesSlugKey = 'categories_slug_key'
}

/** input type for incrementing numeric columns in table "categories" */
export type Categories_Inc_Input = {
  position?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "categories" */
export type Categories_Insert_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  lessons?: Maybe<Lessons_Arr_Rel_Insert_Input>;
  position?: Maybe<Scalars['Int']>;
  previewVideo?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  video?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Categories_Max_Fields = {
  __typename?: 'categories_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  position?: Maybe<Scalars['Int']>;
  previewVideo?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  video?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Categories_Min_Fields = {
  __typename?: 'categories_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  position?: Maybe<Scalars['Int']>;
  previewVideo?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  video?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "categories" */
export type Categories_Mutation_Response = {
  __typename?: 'categories_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Categories>;
};

/** input type for inserting object relation for remote table "categories" */
export type Categories_Obj_Rel_Insert_Input = {
  data: Categories_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Categories_On_Conflict>;
};

/** on_conflict condition type for table "categories" */
export type Categories_On_Conflict = {
  constraint: Categories_Constraint;
  update_columns: Array<Categories_Update_Column>;
  where?: Maybe<Categories_Bool_Exp>;
};

/** Ordering options when selecting data from "categories". */
export type Categories_Order_By = {
  createdAt?: Maybe<Order_By>;
  description?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  lessons_aggregate?: Maybe<Lessons_Aggregate_Order_By>;
  position?: Maybe<Order_By>;
  previewVideo?: Maybe<Order_By>;
  slug?: Maybe<Order_By>;
  title?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  video?: Maybe<Order_By>;
};

/** primary key columns input for table: categories */
export type Categories_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "categories" */
export enum Categories_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Position = 'position',
  /** column name */
  PreviewVideo = 'previewVideo',
  /** column name */
  Slug = 'slug',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Video = 'video'
}

/** input type for updating data in table "categories" */
export type Categories_Set_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  position?: Maybe<Scalars['Int']>;
  previewVideo?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  video?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Categories_Stddev_Fields = {
  __typename?: 'categories_stddev_fields';
  position?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Categories_Stddev_Pop_Fields = {
  __typename?: 'categories_stddev_pop_fields';
  position?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Categories_Stddev_Samp_Fields = {
  __typename?: 'categories_stddev_samp_fields';
  position?: Maybe<Scalars['Float']>;
};

/** Streaming cursor of the table "categories" */
export type Categories_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Categories_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Categories_Stream_Cursor_Value_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  position?: Maybe<Scalars['Int']>;
  previewVideo?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  video?: Maybe<Scalars['String']>;
};

/** aggregate sum on columns */
export type Categories_Sum_Fields = {
  __typename?: 'categories_sum_fields';
  position?: Maybe<Scalars['Int']>;
};

/** update columns of table "categories" */
export enum Categories_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Position = 'position',
  /** column name */
  PreviewVideo = 'previewVideo',
  /** column name */
  Slug = 'slug',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Video = 'video'
}

export type Categories_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Categories_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Categories_Set_Input>;
  /** filter the rows which have to be updated */
  where: Categories_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Categories_Var_Pop_Fields = {
  __typename?: 'categories_var_pop_fields';
  position?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Categories_Var_Samp_Fields = {
  __typename?: 'categories_var_samp_fields';
  position?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Categories_Variance_Fields = {
  __typename?: 'categories_variance_fields';
  position?: Maybe<Scalars['Float']>;
};

/** columns and relationships of "checkout_event_log" */
export type Checkout_Event_Log = {
  __typename?: 'checkout_event_log';
  createdAt: Scalars['timestamptz'];
  id: Scalars['uuid'];
  updatedAt: Scalars['timestamptz'];
  userId: Scalars['String'];
};

/** aggregated selection of "checkout_event_log" */
export type Checkout_Event_Log_Aggregate = {
  __typename?: 'checkout_event_log_aggregate';
  aggregate?: Maybe<Checkout_Event_Log_Aggregate_Fields>;
  nodes: Array<Checkout_Event_Log>;
};

/** aggregate fields of "checkout_event_log" */
export type Checkout_Event_Log_Aggregate_Fields = {
  __typename?: 'checkout_event_log_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Checkout_Event_Log_Max_Fields>;
  min?: Maybe<Checkout_Event_Log_Min_Fields>;
};


/** aggregate fields of "checkout_event_log" */
export type Checkout_Event_Log_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Checkout_Event_Log_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "checkout_event_log". All fields are combined with a logical 'AND'. */
export type Checkout_Event_Log_Bool_Exp = {
  _and?: Maybe<Array<Checkout_Event_Log_Bool_Exp>>;
  _not?: Maybe<Checkout_Event_Log_Bool_Exp>;
  _or?: Maybe<Array<Checkout_Event_Log_Bool_Exp>>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "checkout_event_log" */
export enum Checkout_Event_Log_Constraint {
  /** unique or primary key constraint on columns "id" */
  CheckoutEventLogPkey = 'checkout_event_log_pkey'
}

/** input type for inserting data into table "checkout_event_log" */
export type Checkout_Event_Log_Insert_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Checkout_Event_Log_Max_Fields = {
  __typename?: 'checkout_event_log_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Checkout_Event_Log_Min_Fields = {
  __typename?: 'checkout_event_log_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "checkout_event_log" */
export type Checkout_Event_Log_Mutation_Response = {
  __typename?: 'checkout_event_log_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Checkout_Event_Log>;
};

/** on_conflict condition type for table "checkout_event_log" */
export type Checkout_Event_Log_On_Conflict = {
  constraint: Checkout_Event_Log_Constraint;
  update_columns: Array<Checkout_Event_Log_Update_Column>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};

/** Ordering options when selecting data from "checkout_event_log". */
export type Checkout_Event_Log_Order_By = {
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** primary key columns input for table: checkout_event_log */
export type Checkout_Event_Log_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "checkout_event_log" */
export enum Checkout_Event_Log_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "checkout_event_log" */
export type Checkout_Event_Log_Set_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** Streaming cursor of the table "checkout_event_log" */
export type Checkout_Event_Log_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Checkout_Event_Log_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Checkout_Event_Log_Stream_Cursor_Value_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** update columns of table "checkout_event_log" */
export enum Checkout_Event_Log_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

export type Checkout_Event_Log_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Checkout_Event_Log_Set_Input>;
  /** filter the rows which have to be updated */
  where: Checkout_Event_Log_Bool_Exp;
};

/** columns and relationships of "code_drafts" */
export type Code_Drafts = {
  __typename?: 'code_drafts';
  code?: Maybe<Scalars['String']>;
  createdAt: Scalars['timestamptz'];
  id: Scalars['uuid'];
  language: Scalars['String'];
  /** An object relationship */
  lesson: Lessons;
  lessonId: Scalars['uuid'];
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  userId: Scalars['String'];
};

/** aggregated selection of "code_drafts" */
export type Code_Drafts_Aggregate = {
  __typename?: 'code_drafts_aggregate';
  aggregate?: Maybe<Code_Drafts_Aggregate_Fields>;
  nodes: Array<Code_Drafts>;
};

/** aggregate fields of "code_drafts" */
export type Code_Drafts_Aggregate_Fields = {
  __typename?: 'code_drafts_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Code_Drafts_Max_Fields>;
  min?: Maybe<Code_Drafts_Min_Fields>;
};


/** aggregate fields of "code_drafts" */
export type Code_Drafts_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Code_Drafts_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "code_drafts". All fields are combined with a logical 'AND'. */
export type Code_Drafts_Bool_Exp = {
  _and?: Maybe<Array<Code_Drafts_Bool_Exp>>;
  _not?: Maybe<Code_Drafts_Bool_Exp>;
  _or?: Maybe<Array<Code_Drafts_Bool_Exp>>;
  code?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  language?: Maybe<String_Comparison_Exp>;
  lesson?: Maybe<Lessons_Bool_Exp>;
  lessonId?: Maybe<Uuid_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "code_drafts" */
export enum Code_Drafts_Constraint {
  /** unique or primary key constraint on columns "userId", "language", "lessonId" */
  CodeDraftsLanguageUserIdLessonIdKey = 'code_drafts_language_userId_lessonId_key',
  /** unique or primary key constraint on columns "id" */
  CodeDraftsPkey = 'code_drafts_pkey'
}

/** input type for inserting data into table "code_drafts" */
export type Code_Drafts_Insert_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  language?: Maybe<Scalars['String']>;
  lesson?: Maybe<Lessons_Obj_Rel_Insert_Input>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Code_Drafts_Max_Fields = {
  __typename?: 'code_drafts_max_fields';
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Code_Drafts_Min_Fields = {
  __typename?: 'code_drafts_min_fields';
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "code_drafts" */
export type Code_Drafts_Mutation_Response = {
  __typename?: 'code_drafts_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Code_Drafts>;
};

/** on_conflict condition type for table "code_drafts" */
export type Code_Drafts_On_Conflict = {
  constraint: Code_Drafts_Constraint;
  update_columns: Array<Code_Drafts_Update_Column>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};

/** Ordering options when selecting data from "code_drafts". */
export type Code_Drafts_Order_By = {
  code?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  language?: Maybe<Order_By>;
  lesson?: Maybe<Lessons_Order_By>;
  lessonId?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
};

/** primary key columns input for table: code_drafts */
export type Code_Drafts_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "code_drafts" */
export enum Code_Drafts_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Language = 'language',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "code_drafts" */
export type Code_Drafts_Set_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** Streaming cursor of the table "code_drafts" */
export type Code_Drafts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Code_Drafts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Code_Drafts_Stream_Cursor_Value_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** update columns of table "code_drafts" */
export enum Code_Drafts_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Language = 'language',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

export type Code_Drafts_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Code_Drafts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Code_Drafts_Bool_Exp;
};

/** columns and relationships of "code_submissions" */
export type Code_Submissions = {
  __typename?: 'code_submissions';
  code: Scalars['String'];
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt: Scalars['timestamptz'];
  diagnostics?: Maybe<Scalars['jsonb']>;
  environment: Scalars['String'];
  executionStatus: Scalars['String'];
  id: Scalars['uuid'];
  ipHash?: Maybe<Scalars['String']>;
  language: Scalars['String'];
  /** An object relationship */
  lesson: Lessons;
  lessonId: Scalars['uuid'];
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  results?: Maybe<Scalars['jsonb']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests: Scalars['String'];
  time?: Maybe<Scalars['String']>;
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user?: Maybe<Users>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};


/** columns and relationships of "code_submissions" */
export type Code_SubmissionsDiagnosticsArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "code_submissions" */
export type Code_SubmissionsResultsArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "code_submissions" */
export type Code_Submissions_Aggregate = {
  __typename?: 'code_submissions_aggregate';
  aggregate?: Maybe<Code_Submissions_Aggregate_Fields>;
  nodes: Array<Code_Submissions>;
};

/** aggregate fields of "code_submissions" */
export type Code_Submissions_Aggregate_Fields = {
  __typename?: 'code_submissions_aggregate_fields';
  avg?: Maybe<Code_Submissions_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Code_Submissions_Max_Fields>;
  min?: Maybe<Code_Submissions_Min_Fields>;
  stddev?: Maybe<Code_Submissions_Stddev_Fields>;
  stddev_pop?: Maybe<Code_Submissions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Code_Submissions_Stddev_Samp_Fields>;
  sum?: Maybe<Code_Submissions_Sum_Fields>;
  var_pop?: Maybe<Code_Submissions_Var_Pop_Fields>;
  var_samp?: Maybe<Code_Submissions_Var_Samp_Fields>;
  variance?: Maybe<Code_Submissions_Variance_Fields>;
};


/** aggregate fields of "code_submissions" */
export type Code_Submissions_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Code_Submissions_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Code_Submissions_Append_Input = {
  diagnostics?: Maybe<Scalars['jsonb']>;
  results?: Maybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Code_Submissions_Avg_Fields = {
  __typename?: 'code_submissions_avg_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "code_submissions". All fields are combined with a logical 'AND'. */
export type Code_Submissions_Bool_Exp = {
  _and?: Maybe<Array<Code_Submissions_Bool_Exp>>;
  _not?: Maybe<Code_Submissions_Bool_Exp>;
  _or?: Maybe<Array<Code_Submissions_Bool_Exp>>;
  code?: Maybe<String_Comparison_Exp>;
  codeRunnerStatusDescription?: Maybe<String_Comparison_Exp>;
  codeRunnerStatusId?: Maybe<Int_Comparison_Exp>;
  codeRunnerToken?: Maybe<String_Comparison_Exp>;
  compileOutput?: Maybe<String_Comparison_Exp>;
  compileOutputDecoded?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  diagnostics?: Maybe<Jsonb_Comparison_Exp>;
  environment?: Maybe<String_Comparison_Exp>;
  executionStatus?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  ipHash?: Maybe<String_Comparison_Exp>;
  language?: Maybe<String_Comparison_Exp>;
  lesson?: Maybe<Lessons_Bool_Exp>;
  lessonId?: Maybe<Uuid_Comparison_Exp>;
  logs?: Maybe<String_Comparison_Exp>;
  memory?: Maybe<Numeric_Comparison_Exp>;
  message?: Maybe<String_Comparison_Exp>;
  messageDecoded?: Maybe<String_Comparison_Exp>;
  resultStatus?: Maybe<String_Comparison_Exp>;
  results?: Maybe<Jsonb_Comparison_Exp>;
  runnerVersion?: Maybe<String_Comparison_Exp>;
  stderr?: Maybe<String_Comparison_Exp>;
  stderrDecoded?: Maybe<String_Comparison_Exp>;
  stdout?: Maybe<String_Comparison_Exp>;
  stdoutDecoded?: Maybe<String_Comparison_Exp>;
  tests?: Maybe<String_Comparison_Exp>;
  time?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
  validator?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "code_submissions" */
export enum Code_Submissions_Constraint {
  /** unique or primary key constraint on columns "codeRunnerToken" */
  CodeSubmissionsCodeRunnerTokenKey = 'code_submissions_codeRunnerToken_key',
  /** unique or primary key constraint on columns "id" */
  CodeSubmissionsPkey = 'code_submissions_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Code_Submissions_Delete_At_Path_Input = {
  diagnostics?: Maybe<Array<Scalars['String']>>;
  results?: Maybe<Array<Scalars['String']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type Code_Submissions_Delete_Elem_Input = {
  diagnostics?: Maybe<Scalars['Int']>;
  results?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Code_Submissions_Delete_Key_Input = {
  diagnostics?: Maybe<Scalars['String']>;
  results?: Maybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "code_submissions" */
export type Code_Submissions_Inc_Input = {
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  memory?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "code_submissions" */
export type Code_Submissions_Insert_Input = {
  code?: Maybe<Scalars['String']>;
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  diagnostics?: Maybe<Scalars['jsonb']>;
  environment?: Maybe<Scalars['String']>;
  executionStatus?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ipHash?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lesson?: Maybe<Lessons_Obj_Rel_Insert_Input>;
  lessonId?: Maybe<Scalars['uuid']>;
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  results?: Maybe<Scalars['jsonb']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Code_Submissions_Max_Fields = {
  __typename?: 'code_submissions_max_fields';
  code?: Maybe<Scalars['String']>;
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  environment?: Maybe<Scalars['String']>;
  executionStatus?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ipHash?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Code_Submissions_Min_Fields = {
  __typename?: 'code_submissions_min_fields';
  code?: Maybe<Scalars['String']>;
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  environment?: Maybe<Scalars['String']>;
  executionStatus?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ipHash?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "code_submissions" */
export type Code_Submissions_Mutation_Response = {
  __typename?: 'code_submissions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Code_Submissions>;
};

/** on_conflict condition type for table "code_submissions" */
export type Code_Submissions_On_Conflict = {
  constraint: Code_Submissions_Constraint;
  update_columns: Array<Code_Submissions_Update_Column>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};

/** Ordering options when selecting data from "code_submissions". */
export type Code_Submissions_Order_By = {
  code?: Maybe<Order_By>;
  codeRunnerStatusDescription?: Maybe<Order_By>;
  codeRunnerStatusId?: Maybe<Order_By>;
  codeRunnerToken?: Maybe<Order_By>;
  compileOutput?: Maybe<Order_By>;
  compileOutputDecoded?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  diagnostics?: Maybe<Order_By>;
  environment?: Maybe<Order_By>;
  executionStatus?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ipHash?: Maybe<Order_By>;
  language?: Maybe<Order_By>;
  lesson?: Maybe<Lessons_Order_By>;
  lessonId?: Maybe<Order_By>;
  logs?: Maybe<Order_By>;
  memory?: Maybe<Order_By>;
  message?: Maybe<Order_By>;
  messageDecoded?: Maybe<Order_By>;
  resultStatus?: Maybe<Order_By>;
  results?: Maybe<Order_By>;
  runnerVersion?: Maybe<Order_By>;
  stderr?: Maybe<Order_By>;
  stderrDecoded?: Maybe<Order_By>;
  stdout?: Maybe<Order_By>;
  stdoutDecoded?: Maybe<Order_By>;
  tests?: Maybe<Order_By>;
  time?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
  validator?: Maybe<Order_By>;
};

/** primary key columns input for table: code_submissions */
export type Code_Submissions_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Code_Submissions_Prepend_Input = {
  diagnostics?: Maybe<Scalars['jsonb']>;
  results?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "code_submissions" */
export enum Code_Submissions_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CodeRunnerStatusDescription = 'codeRunnerStatusDescription',
  /** column name */
  CodeRunnerStatusId = 'codeRunnerStatusId',
  /** column name */
  CodeRunnerToken = 'codeRunnerToken',
  /** column name */
  CompileOutput = 'compileOutput',
  /** column name */
  CompileOutputDecoded = 'compileOutputDecoded',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Diagnostics = 'diagnostics',
  /** column name */
  Environment = 'environment',
  /** column name */
  ExecutionStatus = 'executionStatus',
  /** column name */
  Id = 'id',
  /** column name */
  IpHash = 'ipHash',
  /** column name */
  Language = 'language',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  Logs = 'logs',
  /** column name */
  Memory = 'memory',
  /** column name */
  Message = 'message',
  /** column name */
  MessageDecoded = 'messageDecoded',
  /** column name */
  ResultStatus = 'resultStatus',
  /** column name */
  Results = 'results',
  /** column name */
  RunnerVersion = 'runnerVersion',
  /** column name */
  Stderr = 'stderr',
  /** column name */
  StderrDecoded = 'stderrDecoded',
  /** column name */
  Stdout = 'stdout',
  /** column name */
  StdoutDecoded = 'stdoutDecoded',
  /** column name */
  Tests = 'tests',
  /** column name */
  Time = 'time',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId',
  /** column name */
  Validator = 'validator'
}

/** input type for updating data in table "code_submissions" */
export type Code_Submissions_Set_Input = {
  code?: Maybe<Scalars['String']>;
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  diagnostics?: Maybe<Scalars['jsonb']>;
  environment?: Maybe<Scalars['String']>;
  executionStatus?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ipHash?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  results?: Maybe<Scalars['jsonb']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Code_Submissions_Stddev_Fields = {
  __typename?: 'code_submissions_stddev_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Code_Submissions_Stddev_Pop_Fields = {
  __typename?: 'code_submissions_stddev_pop_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Code_Submissions_Stddev_Samp_Fields = {
  __typename?: 'code_submissions_stddev_samp_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** Streaming cursor of the table "code_submissions" */
export type Code_Submissions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Code_Submissions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Code_Submissions_Stream_Cursor_Value_Input = {
  code?: Maybe<Scalars['String']>;
  codeRunnerStatusDescription?: Maybe<Scalars['String']>;
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  codeRunnerToken?: Maybe<Scalars['String']>;
  compileOutput?: Maybe<Scalars['String']>;
  compileOutputDecoded?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  diagnostics?: Maybe<Scalars['jsonb']>;
  environment?: Maybe<Scalars['String']>;
  executionStatus?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ipHash?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lessonId?: Maybe<Scalars['uuid']>;
  logs?: Maybe<Scalars['String']>;
  memory?: Maybe<Scalars['numeric']>;
  message?: Maybe<Scalars['String']>;
  messageDecoded?: Maybe<Scalars['String']>;
  resultStatus?: Maybe<Scalars['String']>;
  results?: Maybe<Scalars['jsonb']>;
  runnerVersion?: Maybe<Scalars['String']>;
  stderr?: Maybe<Scalars['String']>;
  stderrDecoded?: Maybe<Scalars['String']>;
  stdout?: Maybe<Scalars['String']>;
  stdoutDecoded?: Maybe<Scalars['String']>;
  tests?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validator?: Maybe<Scalars['String']>;
};

/** aggregate sum on columns */
export type Code_Submissions_Sum_Fields = {
  __typename?: 'code_submissions_sum_fields';
  codeRunnerStatusId?: Maybe<Scalars['Int']>;
  memory?: Maybe<Scalars['numeric']>;
};

/** update columns of table "code_submissions" */
export enum Code_Submissions_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CodeRunnerStatusDescription = 'codeRunnerStatusDescription',
  /** column name */
  CodeRunnerStatusId = 'codeRunnerStatusId',
  /** column name */
  CodeRunnerToken = 'codeRunnerToken',
  /** column name */
  CompileOutput = 'compileOutput',
  /** column name */
  CompileOutputDecoded = 'compileOutputDecoded',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Diagnostics = 'diagnostics',
  /** column name */
  Environment = 'environment',
  /** column name */
  ExecutionStatus = 'executionStatus',
  /** column name */
  Id = 'id',
  /** column name */
  IpHash = 'ipHash',
  /** column name */
  Language = 'language',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  Logs = 'logs',
  /** column name */
  Memory = 'memory',
  /** column name */
  Message = 'message',
  /** column name */
  MessageDecoded = 'messageDecoded',
  /** column name */
  ResultStatus = 'resultStatus',
  /** column name */
  Results = 'results',
  /** column name */
  RunnerVersion = 'runnerVersion',
  /** column name */
  Stderr = 'stderr',
  /** column name */
  StderrDecoded = 'stderrDecoded',
  /** column name */
  Stdout = 'stdout',
  /** column name */
  StdoutDecoded = 'stdoutDecoded',
  /** column name */
  Tests = 'tests',
  /** column name */
  Time = 'time',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId',
  /** column name */
  Validator = 'validator'
}

export type Code_Submissions_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: Maybe<Code_Submissions_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: Maybe<Code_Submissions_Delete_At_Path_Input>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _delete_elem?: Maybe<Code_Submissions_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: Maybe<Code_Submissions_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Code_Submissions_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: Maybe<Code_Submissions_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Code_Submissions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Code_Submissions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Code_Submissions_Var_Pop_Fields = {
  __typename?: 'code_submissions_var_pop_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Code_Submissions_Var_Samp_Fields = {
  __typename?: 'code_submissions_var_samp_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Code_Submissions_Variance_Fields = {
  __typename?: 'code_submissions_variance_fields';
  codeRunnerStatusId?: Maybe<Scalars['Float']>;
  memory?: Maybe<Scalars['Float']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** columns and relationships of "gift_cards" */
export type Gift_Cards = {
  __typename?: 'gift_cards';
  code: Scalars['String'];
  createdAt: Scalars['timestamptz'];
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  /** An object relationship */
  product?: Maybe<Products>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  /** An object relationship */
  receiver?: Maybe<Users>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  /** An object relationship */
  redeemer?: Maybe<Users>;
  redeemerId?: Maybe<Scalars['String']>;
  /** An object relationship */
  sale?: Maybe<Sales>;
  saleId?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  sender?: Maybe<Users>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source: Scalars['String'];
  status: Scalars['String'];
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
};

/** aggregated selection of "gift_cards" */
export type Gift_Cards_Aggregate = {
  __typename?: 'gift_cards_aggregate';
  aggregate?: Maybe<Gift_Cards_Aggregate_Fields>;
  nodes: Array<Gift_Cards>;
};

export type Gift_Cards_Aggregate_Bool_Exp = {
  count?: Maybe<Gift_Cards_Aggregate_Bool_Exp_Count>;
};

export type Gift_Cards_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Gift_Cards_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Gift_Cards_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "gift_cards" */
export type Gift_Cards_Aggregate_Fields = {
  __typename?: 'gift_cards_aggregate_fields';
  avg?: Maybe<Gift_Cards_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Gift_Cards_Max_Fields>;
  min?: Maybe<Gift_Cards_Min_Fields>;
  stddev?: Maybe<Gift_Cards_Stddev_Fields>;
  stddev_pop?: Maybe<Gift_Cards_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Gift_Cards_Stddev_Samp_Fields>;
  sum?: Maybe<Gift_Cards_Sum_Fields>;
  var_pop?: Maybe<Gift_Cards_Var_Pop_Fields>;
  var_samp?: Maybe<Gift_Cards_Var_Samp_Fields>;
  variance?: Maybe<Gift_Cards_Variance_Fields>;
};


/** aggregate fields of "gift_cards" */
export type Gift_Cards_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Gift_Cards_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "gift_cards" */
export type Gift_Cards_Aggregate_Order_By = {
  avg?: Maybe<Gift_Cards_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Gift_Cards_Max_Order_By>;
  min?: Maybe<Gift_Cards_Min_Order_By>;
  stddev?: Maybe<Gift_Cards_Stddev_Order_By>;
  stddev_pop?: Maybe<Gift_Cards_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Gift_Cards_Stddev_Samp_Order_By>;
  sum?: Maybe<Gift_Cards_Sum_Order_By>;
  var_pop?: Maybe<Gift_Cards_Var_Pop_Order_By>;
  var_samp?: Maybe<Gift_Cards_Var_Samp_Order_By>;
  variance?: Maybe<Gift_Cards_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "gift_cards" */
export type Gift_Cards_Arr_Rel_Insert_Input = {
  data: Array<Gift_Cards_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Gift_Cards_On_Conflict>;
};

/** aggregate avg on columns */
export type Gift_Cards_Avg_Fields = {
  __typename?: 'gift_cards_avg_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "gift_cards" */
export type Gift_Cards_Avg_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "gift_cards". All fields are combined with a logical 'AND'. */
export type Gift_Cards_Bool_Exp = {
  _and?: Maybe<Array<Gift_Cards_Bool_Exp>>;
  _not?: Maybe<Gift_Cards_Bool_Exp>;
  _or?: Maybe<Array<Gift_Cards_Bool_Exp>>;
  code?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  creditAmountDollars?: Maybe<Numeric_Comparison_Exp>;
  giftNote?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  product?: Maybe<Products_Bool_Exp>;
  productAccessDays?: Maybe<Int_Comparison_Exp>;
  productDescription?: Maybe<String_Comparison_Exp>;
  productId?: Maybe<Uuid_Comparison_Exp>;
  productName?: Maybe<String_Comparison_Exp>;
  productType?: Maybe<String_Comparison_Exp>;
  receiver?: Maybe<Users_Bool_Exp>;
  receiverEmail?: Maybe<String_Comparison_Exp>;
  receiverId?: Maybe<String_Comparison_Exp>;
  redeemedAt?: Maybe<Timestamptz_Comparison_Exp>;
  redeemer?: Maybe<Users_Bool_Exp>;
  redeemerId?: Maybe<String_Comparison_Exp>;
  sale?: Maybe<Sales_Bool_Exp>;
  saleId?: Maybe<Uuid_Comparison_Exp>;
  sender?: Maybe<Users_Bool_Exp>;
  senderEmail?: Maybe<String_Comparison_Exp>;
  senderId?: Maybe<String_Comparison_Exp>;
  source?: Maybe<String_Comparison_Exp>;
  status?: Maybe<String_Comparison_Exp>;
  stripePriceId?: Maybe<String_Comparison_Exp>;
  stripeProductId?: Maybe<String_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "gift_cards" */
export enum Gift_Cards_Constraint {
  /** unique or primary key constraint on columns "code" */
  GiftCardsCodeKey = 'gift_cards_code_key',
  /** unique or primary key constraint on columns "id" */
  GiftCardsPkey = 'gift_cards_pkey'
}

/** input type for incrementing numeric columns in table "gift_cards" */
export type Gift_Cards_Inc_Input = {
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "gift_cards" */
export type Gift_Cards_Insert_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  product?: Maybe<Products_Obj_Rel_Insert_Input>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  receiver?: Maybe<Users_Obj_Rel_Insert_Input>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  redeemer?: Maybe<Users_Obj_Rel_Insert_Input>;
  redeemerId?: Maybe<Scalars['String']>;
  sale?: Maybe<Sales_Obj_Rel_Insert_Input>;
  saleId?: Maybe<Scalars['uuid']>;
  sender?: Maybe<Users_Obj_Rel_Insert_Input>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Gift_Cards_Max_Fields = {
  __typename?: 'gift_cards_max_fields';
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  redeemerId?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "gift_cards" */
export type Gift_Cards_Max_Order_By = {
  code?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  creditAmountDollars?: Maybe<Order_By>;
  giftNote?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productId?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  receiverEmail?: Maybe<Order_By>;
  receiverId?: Maybe<Order_By>;
  redeemedAt?: Maybe<Order_By>;
  redeemerId?: Maybe<Order_By>;
  saleId?: Maybe<Order_By>;
  senderEmail?: Maybe<Order_By>;
  senderId?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Gift_Cards_Min_Fields = {
  __typename?: 'gift_cards_min_fields';
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  redeemerId?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "gift_cards" */
export type Gift_Cards_Min_Order_By = {
  code?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  creditAmountDollars?: Maybe<Order_By>;
  giftNote?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productId?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  receiverEmail?: Maybe<Order_By>;
  receiverId?: Maybe<Order_By>;
  redeemedAt?: Maybe<Order_By>;
  redeemerId?: Maybe<Order_By>;
  saleId?: Maybe<Order_By>;
  senderEmail?: Maybe<Order_By>;
  senderId?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** response of any mutation on the table "gift_cards" */
export type Gift_Cards_Mutation_Response = {
  __typename?: 'gift_cards_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Gift_Cards>;
};

/** input type for inserting object relation for remote table "gift_cards" */
export type Gift_Cards_Obj_Rel_Insert_Input = {
  data: Gift_Cards_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Gift_Cards_On_Conflict>;
};

/** on_conflict condition type for table "gift_cards" */
export type Gift_Cards_On_Conflict = {
  constraint: Gift_Cards_Constraint;
  update_columns: Array<Gift_Cards_Update_Column>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};

/** Ordering options when selecting data from "gift_cards". */
export type Gift_Cards_Order_By = {
  code?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  creditAmountDollars?: Maybe<Order_By>;
  giftNote?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  product?: Maybe<Products_Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productId?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  receiver?: Maybe<Users_Order_By>;
  receiverEmail?: Maybe<Order_By>;
  receiverId?: Maybe<Order_By>;
  redeemedAt?: Maybe<Order_By>;
  redeemer?: Maybe<Users_Order_By>;
  redeemerId?: Maybe<Order_By>;
  sale?: Maybe<Sales_Order_By>;
  saleId?: Maybe<Order_By>;
  sender?: Maybe<Users_Order_By>;
  senderEmail?: Maybe<Order_By>;
  senderId?: Maybe<Order_By>;
  source?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** primary key columns input for table: gift_cards */
export type Gift_Cards_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "gift_cards" */
export enum Gift_Cards_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  CreditAmountDollars = 'creditAmountDollars',
  /** column name */
  GiftNote = 'giftNote',
  /** column name */
  Id = 'id',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  ProductDescription = 'productDescription',
  /** column name */
  ProductId = 'productId',
  /** column name */
  ProductName = 'productName',
  /** column name */
  ProductType = 'productType',
  /** column name */
  ReceiverEmail = 'receiverEmail',
  /** column name */
  ReceiverId = 'receiverId',
  /** column name */
  RedeemedAt = 'redeemedAt',
  /** column name */
  RedeemerId = 'redeemerId',
  /** column name */
  SaleId = 'saleId',
  /** column name */
  SenderEmail = 'senderEmail',
  /** column name */
  SenderId = 'senderId',
  /** column name */
  Source = 'source',
  /** column name */
  Status = 'status',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "gift_cards" */
export type Gift_Cards_Set_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  redeemerId?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Gift_Cards_Stddev_Fields = {
  __typename?: 'gift_cards_stddev_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "gift_cards" */
export type Gift_Cards_Stddev_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Gift_Cards_Stddev_Pop_Fields = {
  __typename?: 'gift_cards_stddev_pop_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "gift_cards" */
export type Gift_Cards_Stddev_Pop_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Gift_Cards_Stddev_Samp_Fields = {
  __typename?: 'gift_cards_stddev_samp_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "gift_cards" */
export type Gift_Cards_Stddev_Samp_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** Streaming cursor of the table "gift_cards" */
export type Gift_Cards_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Gift_Cards_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Gift_Cards_Stream_Cursor_Value_Input = {
  code?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  giftNote?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productId?: Maybe<Scalars['uuid']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  receiverEmail?: Maybe<Scalars['String']>;
  receiverId?: Maybe<Scalars['String']>;
  redeemedAt?: Maybe<Scalars['timestamptz']>;
  redeemerId?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  senderEmail?: Maybe<Scalars['String']>;
  senderId?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate sum on columns */
export type Gift_Cards_Sum_Fields = {
  __typename?: 'gift_cards_sum_fields';
  creditAmountDollars?: Maybe<Scalars['numeric']>;
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "gift_cards" */
export type Gift_Cards_Sum_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** update columns of table "gift_cards" */
export enum Gift_Cards_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  CreditAmountDollars = 'creditAmountDollars',
  /** column name */
  GiftNote = 'giftNote',
  /** column name */
  Id = 'id',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  ProductDescription = 'productDescription',
  /** column name */
  ProductId = 'productId',
  /** column name */
  ProductName = 'productName',
  /** column name */
  ProductType = 'productType',
  /** column name */
  ReceiverEmail = 'receiverEmail',
  /** column name */
  ReceiverId = 'receiverId',
  /** column name */
  RedeemedAt = 'redeemedAt',
  /** column name */
  RedeemerId = 'redeemerId',
  /** column name */
  SaleId = 'saleId',
  /** column name */
  SenderEmail = 'senderEmail',
  /** column name */
  SenderId = 'senderId',
  /** column name */
  Source = 'source',
  /** column name */
  Status = 'status',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Gift_Cards_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Gift_Cards_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Gift_Cards_Set_Input>;
  /** filter the rows which have to be updated */
  where: Gift_Cards_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Gift_Cards_Var_Pop_Fields = {
  __typename?: 'gift_cards_var_pop_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "gift_cards" */
export type Gift_Cards_Var_Pop_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Gift_Cards_Var_Samp_Fields = {
  __typename?: 'gift_cards_var_samp_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "gift_cards" */
export type Gift_Cards_Var_Samp_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Gift_Cards_Variance_Fields = {
  __typename?: 'gift_cards_variance_fields';
  creditAmountDollars?: Maybe<Scalars['Float']>;
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "gift_cards" */
export type Gift_Cards_Variance_Order_By = {
  creditAmountDollars?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: Maybe<Scalars['Int']>;
  _gt?: Maybe<Scalars['Int']>;
  _gte?: Maybe<Scalars['Int']>;
  _in?: Maybe<Array<Scalars['Int']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Int']>;
  _lte?: Maybe<Scalars['Int']>;
  _neq?: Maybe<Scalars['Int']>;
  _nin?: Maybe<Array<Scalars['Int']>>;
};


export type Jsonb_Cast_Exp = {
  String?: Maybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: Maybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: Maybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: Maybe<Scalars['jsonb']>;
  _eq?: Maybe<Scalars['jsonb']>;
  _gt?: Maybe<Scalars['jsonb']>;
  _gte?: Maybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: Maybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: Maybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: Maybe<Array<Scalars['String']>>;
  _in?: Maybe<Array<Scalars['jsonb']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['jsonb']>;
  _lte?: Maybe<Scalars['jsonb']>;
  _neq?: Maybe<Scalars['jsonb']>;
  _nin?: Maybe<Array<Scalars['jsonb']>>;
};

/** columns and relationships of "lessons" */
export type Lessons = {
  __typename?: 'lessons';
  accessLevel: Scalars['String'];
  /** An object relationship */
  category: Categories;
  categoryId: Scalars['uuid'];
  createdAt: Scalars['timestamptz'];
  description: Scalars['String'];
  difficulty?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug: Scalars['String'];
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  title: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
};

/** aggregated selection of "lessons" */
export type Lessons_Aggregate = {
  __typename?: 'lessons_aggregate';
  aggregate?: Maybe<Lessons_Aggregate_Fields>;
  nodes: Array<Lessons>;
};

export type Lessons_Aggregate_Bool_Exp = {
  count?: Maybe<Lessons_Aggregate_Bool_Exp_Count>;
};

export type Lessons_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Lessons_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Lessons_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "lessons" */
export type Lessons_Aggregate_Fields = {
  __typename?: 'lessons_aggregate_fields';
  avg?: Maybe<Lessons_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Lessons_Max_Fields>;
  min?: Maybe<Lessons_Min_Fields>;
  stddev?: Maybe<Lessons_Stddev_Fields>;
  stddev_pop?: Maybe<Lessons_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Lessons_Stddev_Samp_Fields>;
  sum?: Maybe<Lessons_Sum_Fields>;
  var_pop?: Maybe<Lessons_Var_Pop_Fields>;
  var_samp?: Maybe<Lessons_Var_Samp_Fields>;
  variance?: Maybe<Lessons_Variance_Fields>;
};


/** aggregate fields of "lessons" */
export type Lessons_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Lessons_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "lessons" */
export type Lessons_Aggregate_Order_By = {
  avg?: Maybe<Lessons_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Lessons_Max_Order_By>;
  min?: Maybe<Lessons_Min_Order_By>;
  stddev?: Maybe<Lessons_Stddev_Order_By>;
  stddev_pop?: Maybe<Lessons_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Lessons_Stddev_Samp_Order_By>;
  sum?: Maybe<Lessons_Sum_Order_By>;
  var_pop?: Maybe<Lessons_Var_Pop_Order_By>;
  var_samp?: Maybe<Lessons_Var_Samp_Order_By>;
  variance?: Maybe<Lessons_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "lessons" */
export type Lessons_Arr_Rel_Insert_Input = {
  data: Array<Lessons_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Lessons_On_Conflict>;
};

/** aggregate avg on columns */
export type Lessons_Avg_Fields = {
  __typename?: 'lessons_avg_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "lessons" */
export type Lessons_Avg_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "lessons". All fields are combined with a logical 'AND'. */
export type Lessons_Bool_Exp = {
  _and?: Maybe<Array<Lessons_Bool_Exp>>;
  _not?: Maybe<Lessons_Bool_Exp>;
  _or?: Maybe<Array<Lessons_Bool_Exp>>;
  accessLevel?: Maybe<String_Comparison_Exp>;
  category?: Maybe<Categories_Bool_Exp>;
  categoryId?: Maybe<Uuid_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  description?: Maybe<String_Comparison_Exp>;
  difficulty?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  introductionVideoUrl?: Maybe<String_Comparison_Exp>;
  metaDescription?: Maybe<String_Comparison_Exp>;
  metaTitle?: Maybe<String_Comparison_Exp>;
  position?: Maybe<Int_Comparison_Exp>;
  slug?: Maybe<String_Comparison_Exp>;
  solutionVideoUrl?: Maybe<String_Comparison_Exp>;
  status?: Maybe<String_Comparison_Exp>;
  title?: Maybe<String_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "lessons" */
export enum Lessons_Constraint {
  /** unique or primary key constraint on columns "id" */
  LessonsPkey = 'lessons_pkey',
  /** unique or primary key constraint on columns "position" */
  LessonsPositionKey = 'lessons_position_key',
  /** unique or primary key constraint on columns "slug" */
  LessonsSlugKey = 'lessons_slug_key'
}

/** input type for incrementing numeric columns in table "lessons" */
export type Lessons_Inc_Input = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "lessons" */
export type Lessons_Insert_Input = {
  accessLevel?: Maybe<Scalars['String']>;
  category?: Maybe<Categories_Obj_Rel_Insert_Input>;
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Lessons_Max_Fields = {
  __typename?: 'lessons_max_fields';
  accessLevel?: Maybe<Scalars['String']>;
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "lessons" */
export type Lessons_Max_Order_By = {
  accessLevel?: Maybe<Order_By>;
  categoryId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  description?: Maybe<Order_By>;
  difficulty?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  introductionVideoUrl?: Maybe<Order_By>;
  metaDescription?: Maybe<Order_By>;
  metaTitle?: Maybe<Order_By>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
  slug?: Maybe<Order_By>;
  solutionVideoUrl?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  title?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Lessons_Min_Fields = {
  __typename?: 'lessons_min_fields';
  accessLevel?: Maybe<Scalars['String']>;
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "lessons" */
export type Lessons_Min_Order_By = {
  accessLevel?: Maybe<Order_By>;
  categoryId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  description?: Maybe<Order_By>;
  difficulty?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  introductionVideoUrl?: Maybe<Order_By>;
  metaDescription?: Maybe<Order_By>;
  metaTitle?: Maybe<Order_By>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
  slug?: Maybe<Order_By>;
  solutionVideoUrl?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  title?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** response of any mutation on the table "lessons" */
export type Lessons_Mutation_Response = {
  __typename?: 'lessons_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Lessons>;
};

/** input type for inserting object relation for remote table "lessons" */
export type Lessons_Obj_Rel_Insert_Input = {
  data: Lessons_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Lessons_On_Conflict>;
};

/** on_conflict condition type for table "lessons" */
export type Lessons_On_Conflict = {
  constraint: Lessons_Constraint;
  update_columns: Array<Lessons_Update_Column>;
  where?: Maybe<Lessons_Bool_Exp>;
};

/** Ordering options when selecting data from "lessons". */
export type Lessons_Order_By = {
  accessLevel?: Maybe<Order_By>;
  category?: Maybe<Categories_Order_By>;
  categoryId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  description?: Maybe<Order_By>;
  difficulty?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  introductionVideoUrl?: Maybe<Order_By>;
  metaDescription?: Maybe<Order_By>;
  metaTitle?: Maybe<Order_By>;
  position?: Maybe<Order_By>;
  slug?: Maybe<Order_By>;
  solutionVideoUrl?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  title?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** primary key columns input for table: lessons */
export type Lessons_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "lessons" */
export enum Lessons_Select_Column {
  /** column name */
  AccessLevel = 'accessLevel',
  /** column name */
  CategoryId = 'categoryId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Difficulty = 'difficulty',
  /** column name */
  Id = 'id',
  /** column name */
  IntroductionVideoUrl = 'introductionVideoUrl',
  /** column name */
  MetaDescription = 'metaDescription',
  /** column name */
  MetaTitle = 'metaTitle',
  /** column name */
  Position = 'position',
  /** column name */
  Slug = 'slug',
  /** column name */
  SolutionVideoUrl = 'solutionVideoUrl',
  /** column name */
  Status = 'status',
  /** column name */
  Title = 'title',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "lessons" */
export type Lessons_Set_Input = {
  accessLevel?: Maybe<Scalars['String']>;
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Lessons_Stddev_Fields = {
  __typename?: 'lessons_stddev_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "lessons" */
export type Lessons_Stddev_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Lessons_Stddev_Pop_Fields = {
  __typename?: 'lessons_stddev_pop_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "lessons" */
export type Lessons_Stddev_Pop_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Lessons_Stddev_Samp_Fields = {
  __typename?: 'lessons_stddev_samp_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "lessons" */
export type Lessons_Stddev_Samp_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** Streaming cursor of the table "lessons" */
export type Lessons_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Lessons_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Lessons_Stream_Cursor_Value_Input = {
  accessLevel?: Maybe<Scalars['String']>;
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  introductionVideoUrl?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaTitle?: Maybe<Scalars['String']>;
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  solutionVideoUrl?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate sum on columns */
export type Lessons_Sum_Fields = {
  __typename?: 'lessons_sum_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "lessons" */
export type Lessons_Sum_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** update columns of table "lessons" */
export enum Lessons_Update_Column {
  /** column name */
  AccessLevel = 'accessLevel',
  /** column name */
  CategoryId = 'categoryId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Difficulty = 'difficulty',
  /** column name */
  Id = 'id',
  /** column name */
  IntroductionVideoUrl = 'introductionVideoUrl',
  /** column name */
  MetaDescription = 'metaDescription',
  /** column name */
  MetaTitle = 'metaTitle',
  /** column name */
  Position = 'position',
  /** column name */
  Slug = 'slug',
  /** column name */
  SolutionVideoUrl = 'solutionVideoUrl',
  /** column name */
  Status = 'status',
  /** column name */
  Title = 'title',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Lessons_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Lessons_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Lessons_Set_Input>;
  /** filter the rows which have to be updated */
  where: Lessons_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Lessons_Var_Pop_Fields = {
  __typename?: 'lessons_var_pop_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "lessons" */
export type Lessons_Var_Pop_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Lessons_Var_Samp_Fields = {
  __typename?: 'lessons_var_samp_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "lessons" */
export type Lessons_Var_Samp_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Lessons_Variance_Fields = {
  __typename?: 'lessons_variance_fields';
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "lessons" */
export type Lessons_Variance_Order_By = {
  /**
   * The position (asc) that the item should appear in the course. If null, it
   * should not be listed in the course table of contents.
   */
  position?: Maybe<Order_By>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "affiliate_link_clicks" */
  delete_affiliate_link_clicks?: Maybe<Affiliate_Link_Clicks_Mutation_Response>;
  /** delete single row from the table: "affiliate_link_clicks" */
  delete_affiliate_link_clicks_by_pk?: Maybe<Affiliate_Link_Clicks>;
  /** delete data from the table: "affiliate_payouts" */
  delete_affiliate_payouts?: Maybe<Affiliate_Payouts_Mutation_Response>;
  /** delete single row from the table: "affiliate_payouts" */
  delete_affiliate_payouts_by_pk?: Maybe<Affiliate_Payouts>;
  /** delete data from the table: "affiliate_sales" */
  delete_affiliate_sales?: Maybe<Affiliate_Sales_Mutation_Response>;
  /** delete data from the table: "alternate_emails" */
  delete_alternate_emails?: Maybe<Alternate_Emails_Mutation_Response>;
  /** delete single row from the table: "alternate_emails" */
  delete_alternate_emails_by_pk?: Maybe<Alternate_Emails>;
  /** delete data from the table: "categories" */
  delete_categories?: Maybe<Categories_Mutation_Response>;
  /** delete single row from the table: "categories" */
  delete_categories_by_pk?: Maybe<Categories>;
  /** delete data from the table: "checkout_event_log" */
  delete_checkout_event_log?: Maybe<Checkout_Event_Log_Mutation_Response>;
  /** delete single row from the table: "checkout_event_log" */
  delete_checkout_event_log_by_pk?: Maybe<Checkout_Event_Log>;
  /** delete data from the table: "code_drafts" */
  delete_code_drafts?: Maybe<Code_Drafts_Mutation_Response>;
  /** delete single row from the table: "code_drafts" */
  delete_code_drafts_by_pk?: Maybe<Code_Drafts>;
  /** delete data from the table: "code_submissions" */
  delete_code_submissions?: Maybe<Code_Submissions_Mutation_Response>;
  /** delete single row from the table: "code_submissions" */
  delete_code_submissions_by_pk?: Maybe<Code_Submissions>;
  /** delete data from the table: "gift_cards" */
  delete_gift_cards?: Maybe<Gift_Cards_Mutation_Response>;
  /** delete single row from the table: "gift_cards" */
  delete_gift_cards_by_pk?: Maybe<Gift_Cards>;
  /** delete data from the table: "lessons" */
  delete_lessons?: Maybe<Lessons_Mutation_Response>;
  /** delete single row from the table: "lessons" */
  delete_lessons_by_pk?: Maybe<Lessons>;
  /** delete data from the table: "products" */
  delete_products?: Maybe<Products_Mutation_Response>;
  /** delete single row from the table: "products" */
  delete_products_by_pk?: Maybe<Products>;
  /** delete data from the table: "related_lessons" */
  delete_related_lessons?: Maybe<Related_Lessons_Mutation_Response>;
  /** delete single row from the table: "related_lessons" */
  delete_related_lessons_by_pk?: Maybe<Related_Lessons>;
  /** delete data from the table: "sales" */
  delete_sales?: Maybe<Sales_Mutation_Response>;
  /** delete single row from the table: "sales" */
  delete_sales_by_pk?: Maybe<Sales>;
  /** delete data from the table: "upgrade_event_log" */
  delete_upgrade_event_log?: Maybe<Upgrade_Event_Log_Mutation_Response>;
  /** delete single row from the table: "upgrade_event_log" */
  delete_upgrade_event_log_by_pk?: Maybe<Upgrade_Event_Log>;
  /** delete data from the table: "user_feedback" */
  delete_user_feedback?: Maybe<User_Feedback_Mutation_Response>;
  /** delete single row from the table: "user_feedback" */
  delete_user_feedback_by_pk?: Maybe<User_Feedback>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "users_lessons_status" */
  delete_users_lessons_status?: Maybe<Users_Lessons_Status_Mutation_Response>;
  /** delete single row from the table: "users_lessons_status" */
  delete_users_lessons_status_by_pk?: Maybe<Users_Lessons_Status>;
  /** insert data into the table: "affiliate_link_clicks" */
  insert_affiliate_link_clicks?: Maybe<Affiliate_Link_Clicks_Mutation_Response>;
  /** insert a single row into the table: "affiliate_link_clicks" */
  insert_affiliate_link_clicks_one?: Maybe<Affiliate_Link_Clicks>;
  /** insert data into the table: "affiliate_payouts" */
  insert_affiliate_payouts?: Maybe<Affiliate_Payouts_Mutation_Response>;
  /** insert a single row into the table: "affiliate_payouts" */
  insert_affiliate_payouts_one?: Maybe<Affiliate_Payouts>;
  /** insert data into the table: "affiliate_sales" */
  insert_affiliate_sales?: Maybe<Affiliate_Sales_Mutation_Response>;
  /** insert a single row into the table: "affiliate_sales" */
  insert_affiliate_sales_one?: Maybe<Affiliate_Sales>;
  /** insert data into the table: "alternate_emails" */
  insert_alternate_emails?: Maybe<Alternate_Emails_Mutation_Response>;
  /** insert a single row into the table: "alternate_emails" */
  insert_alternate_emails_one?: Maybe<Alternate_Emails>;
  /** insert data into the table: "categories" */
  insert_categories?: Maybe<Categories_Mutation_Response>;
  /** insert a single row into the table: "categories" */
  insert_categories_one?: Maybe<Categories>;
  /** insert data into the table: "checkout_event_log" */
  insert_checkout_event_log?: Maybe<Checkout_Event_Log_Mutation_Response>;
  /** insert a single row into the table: "checkout_event_log" */
  insert_checkout_event_log_one?: Maybe<Checkout_Event_Log>;
  /** insert data into the table: "code_drafts" */
  insert_code_drafts?: Maybe<Code_Drafts_Mutation_Response>;
  /** insert a single row into the table: "code_drafts" */
  insert_code_drafts_one?: Maybe<Code_Drafts>;
  /** insert data into the table: "code_submissions" */
  insert_code_submissions?: Maybe<Code_Submissions_Mutation_Response>;
  /** insert a single row into the table: "code_submissions" */
  insert_code_submissions_one?: Maybe<Code_Submissions>;
  /** insert data into the table: "gift_cards" */
  insert_gift_cards?: Maybe<Gift_Cards_Mutation_Response>;
  /** insert a single row into the table: "gift_cards" */
  insert_gift_cards_one?: Maybe<Gift_Cards>;
  /** insert data into the table: "lessons" */
  insert_lessons?: Maybe<Lessons_Mutation_Response>;
  /** insert a single row into the table: "lessons" */
  insert_lessons_one?: Maybe<Lessons>;
  /** insert data into the table: "products" */
  insert_products?: Maybe<Products_Mutation_Response>;
  /** insert a single row into the table: "products" */
  insert_products_one?: Maybe<Products>;
  /** insert data into the table: "related_lessons" */
  insert_related_lessons?: Maybe<Related_Lessons_Mutation_Response>;
  /** insert a single row into the table: "related_lessons" */
  insert_related_lessons_one?: Maybe<Related_Lessons>;
  /** insert data into the table: "sales" */
  insert_sales?: Maybe<Sales_Mutation_Response>;
  /** insert a single row into the table: "sales" */
  insert_sales_one?: Maybe<Sales>;
  /** insert data into the table: "upgrade_event_log" */
  insert_upgrade_event_log?: Maybe<Upgrade_Event_Log_Mutation_Response>;
  /** insert a single row into the table: "upgrade_event_log" */
  insert_upgrade_event_log_one?: Maybe<Upgrade_Event_Log>;
  /** insert data into the table: "user_feedback" */
  insert_user_feedback?: Maybe<User_Feedback_Mutation_Response>;
  /** insert a single row into the table: "user_feedback" */
  insert_user_feedback_one?: Maybe<User_Feedback>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert data into the table: "users_lessons_status" */
  insert_users_lessons_status?: Maybe<Users_Lessons_Status_Mutation_Response>;
  /** insert a single row into the table: "users_lessons_status" */
  insert_users_lessons_status_one?: Maybe<Users_Lessons_Status>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "affiliate_link_clicks" */
  update_affiliate_link_clicks?: Maybe<Affiliate_Link_Clicks_Mutation_Response>;
  /** update single row of the table: "affiliate_link_clicks" */
  update_affiliate_link_clicks_by_pk?: Maybe<Affiliate_Link_Clicks>;
  /** update multiples rows of table: "affiliate_link_clicks" */
  update_affiliate_link_clicks_many?: Maybe<Array<Maybe<Affiliate_Link_Clicks_Mutation_Response>>>;
  /** update data of the table: "affiliate_payouts" */
  update_affiliate_payouts?: Maybe<Affiliate_Payouts_Mutation_Response>;
  /** update single row of the table: "affiliate_payouts" */
  update_affiliate_payouts_by_pk?: Maybe<Affiliate_Payouts>;
  /** update multiples rows of table: "affiliate_payouts" */
  update_affiliate_payouts_many?: Maybe<Array<Maybe<Affiliate_Payouts_Mutation_Response>>>;
  /** update data of the table: "affiliate_sales" */
  update_affiliate_sales?: Maybe<Affiliate_Sales_Mutation_Response>;
  /** update multiples rows of table: "affiliate_sales" */
  update_affiliate_sales_many?: Maybe<Array<Maybe<Affiliate_Sales_Mutation_Response>>>;
  /** update data of the table: "alternate_emails" */
  update_alternate_emails?: Maybe<Alternate_Emails_Mutation_Response>;
  /** update single row of the table: "alternate_emails" */
  update_alternate_emails_by_pk?: Maybe<Alternate_Emails>;
  /** update multiples rows of table: "alternate_emails" */
  update_alternate_emails_many?: Maybe<Array<Maybe<Alternate_Emails_Mutation_Response>>>;
  /** update data of the table: "categories" */
  update_categories?: Maybe<Categories_Mutation_Response>;
  /** update single row of the table: "categories" */
  update_categories_by_pk?: Maybe<Categories>;
  /** update multiples rows of table: "categories" */
  update_categories_many?: Maybe<Array<Maybe<Categories_Mutation_Response>>>;
  /** update data of the table: "checkout_event_log" */
  update_checkout_event_log?: Maybe<Checkout_Event_Log_Mutation_Response>;
  /** update single row of the table: "checkout_event_log" */
  update_checkout_event_log_by_pk?: Maybe<Checkout_Event_Log>;
  /** update multiples rows of table: "checkout_event_log" */
  update_checkout_event_log_many?: Maybe<Array<Maybe<Checkout_Event_Log_Mutation_Response>>>;
  /** update data of the table: "code_drafts" */
  update_code_drafts?: Maybe<Code_Drafts_Mutation_Response>;
  /** update single row of the table: "code_drafts" */
  update_code_drafts_by_pk?: Maybe<Code_Drafts>;
  /** update multiples rows of table: "code_drafts" */
  update_code_drafts_many?: Maybe<Array<Maybe<Code_Drafts_Mutation_Response>>>;
  /** update data of the table: "code_submissions" */
  update_code_submissions?: Maybe<Code_Submissions_Mutation_Response>;
  /** update single row of the table: "code_submissions" */
  update_code_submissions_by_pk?: Maybe<Code_Submissions>;
  /** update multiples rows of table: "code_submissions" */
  update_code_submissions_many?: Maybe<Array<Maybe<Code_Submissions_Mutation_Response>>>;
  /** update data of the table: "gift_cards" */
  update_gift_cards?: Maybe<Gift_Cards_Mutation_Response>;
  /** update single row of the table: "gift_cards" */
  update_gift_cards_by_pk?: Maybe<Gift_Cards>;
  /** update multiples rows of table: "gift_cards" */
  update_gift_cards_many?: Maybe<Array<Maybe<Gift_Cards_Mutation_Response>>>;
  /** update data of the table: "lessons" */
  update_lessons?: Maybe<Lessons_Mutation_Response>;
  /** update single row of the table: "lessons" */
  update_lessons_by_pk?: Maybe<Lessons>;
  /** update multiples rows of table: "lessons" */
  update_lessons_many?: Maybe<Array<Maybe<Lessons_Mutation_Response>>>;
  /** update data of the table: "products" */
  update_products?: Maybe<Products_Mutation_Response>;
  /** update single row of the table: "products" */
  update_products_by_pk?: Maybe<Products>;
  /** update multiples rows of table: "products" */
  update_products_many?: Maybe<Array<Maybe<Products_Mutation_Response>>>;
  /** update data of the table: "related_lessons" */
  update_related_lessons?: Maybe<Related_Lessons_Mutation_Response>;
  /** update single row of the table: "related_lessons" */
  update_related_lessons_by_pk?: Maybe<Related_Lessons>;
  /** update multiples rows of table: "related_lessons" */
  update_related_lessons_many?: Maybe<Array<Maybe<Related_Lessons_Mutation_Response>>>;
  /** update data of the table: "sales" */
  update_sales?: Maybe<Sales_Mutation_Response>;
  /** update single row of the table: "sales" */
  update_sales_by_pk?: Maybe<Sales>;
  /** update multiples rows of table: "sales" */
  update_sales_many?: Maybe<Array<Maybe<Sales_Mutation_Response>>>;
  /** update data of the table: "upgrade_event_log" */
  update_upgrade_event_log?: Maybe<Upgrade_Event_Log_Mutation_Response>;
  /** update single row of the table: "upgrade_event_log" */
  update_upgrade_event_log_by_pk?: Maybe<Upgrade_Event_Log>;
  /** update multiples rows of table: "upgrade_event_log" */
  update_upgrade_event_log_many?: Maybe<Array<Maybe<Upgrade_Event_Log_Mutation_Response>>>;
  /** update data of the table: "user_feedback" */
  update_user_feedback?: Maybe<User_Feedback_Mutation_Response>;
  /** update single row of the table: "user_feedback" */
  update_user_feedback_by_pk?: Maybe<User_Feedback>;
  /** update multiples rows of table: "user_feedback" */
  update_user_feedback_many?: Maybe<Array<Maybe<User_Feedback_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update data of the table: "users_lessons_status" */
  update_users_lessons_status?: Maybe<Users_Lessons_Status_Mutation_Response>;
  /** update single row of the table: "users_lessons_status" */
  update_users_lessons_status_by_pk?: Maybe<Users_Lessons_Status>;
  /** update multiples rows of table: "users_lessons_status" */
  update_users_lessons_status_many?: Maybe<Array<Maybe<Users_Lessons_Status_Mutation_Response>>>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Affiliate_Link_ClicksArgs = {
  where: Affiliate_Link_Clicks_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Affiliate_Link_Clicks_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Affiliate_PayoutsArgs = {
  where: Affiliate_Payouts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Affiliate_Payouts_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Affiliate_SalesArgs = {
  where: Affiliate_Sales_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Alternate_EmailsArgs = {
  where: Alternate_Emails_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Alternate_Emails_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_CategoriesArgs = {
  where: Categories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Categories_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Checkout_Event_LogArgs = {
  where: Checkout_Event_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Checkout_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Code_DraftsArgs = {
  where: Code_Drafts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Code_Drafts_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Code_SubmissionsArgs = {
  where: Code_Submissions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Code_Submissions_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Gift_CardsArgs = {
  where: Gift_Cards_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Gift_Cards_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_LessonsArgs = {
  where: Lessons_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Lessons_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_ProductsArgs = {
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Products_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Related_LessonsArgs = {
  where: Related_Lessons_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Related_Lessons_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_SalesArgs = {
  where: Sales_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Sales_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_Upgrade_Event_LogArgs = {
  where: Upgrade_Event_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Upgrade_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_User_FeedbackArgs = {
  where: User_Feedback_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Feedback_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['String'];
};


/** mutation root */
export type Mutation_RootDelete_Users_Lessons_StatusArgs = {
  where: Users_Lessons_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_Lessons_Status_By_PkArgs = {
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_Link_ClicksArgs = {
  objects: Array<Affiliate_Link_Clicks_Insert_Input>;
  on_conflict?: Maybe<Affiliate_Link_Clicks_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_Link_Clicks_OneArgs = {
  object: Affiliate_Link_Clicks_Insert_Input;
  on_conflict?: Maybe<Affiliate_Link_Clicks_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_PayoutsArgs = {
  objects: Array<Affiliate_Payouts_Insert_Input>;
  on_conflict?: Maybe<Affiliate_Payouts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_Payouts_OneArgs = {
  object: Affiliate_Payouts_Insert_Input;
  on_conflict?: Maybe<Affiliate_Payouts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_SalesArgs = {
  objects: Array<Affiliate_Sales_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_Affiliate_Sales_OneArgs = {
  object: Affiliate_Sales_Insert_Input;
};


/** mutation root */
export type Mutation_RootInsert_Alternate_EmailsArgs = {
  objects: Array<Alternate_Emails_Insert_Input>;
  on_conflict?: Maybe<Alternate_Emails_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Alternate_Emails_OneArgs = {
  object: Alternate_Emails_Insert_Input;
  on_conflict?: Maybe<Alternate_Emails_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_CategoriesArgs = {
  objects: Array<Categories_Insert_Input>;
  on_conflict?: Maybe<Categories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Categories_OneArgs = {
  object: Categories_Insert_Input;
  on_conflict?: Maybe<Categories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Checkout_Event_LogArgs = {
  objects: Array<Checkout_Event_Log_Insert_Input>;
  on_conflict?: Maybe<Checkout_Event_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Checkout_Event_Log_OneArgs = {
  object: Checkout_Event_Log_Insert_Input;
  on_conflict?: Maybe<Checkout_Event_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Code_DraftsArgs = {
  objects: Array<Code_Drafts_Insert_Input>;
  on_conflict?: Maybe<Code_Drafts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Code_Drafts_OneArgs = {
  object: Code_Drafts_Insert_Input;
  on_conflict?: Maybe<Code_Drafts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Code_SubmissionsArgs = {
  objects: Array<Code_Submissions_Insert_Input>;
  on_conflict?: Maybe<Code_Submissions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Code_Submissions_OneArgs = {
  object: Code_Submissions_Insert_Input;
  on_conflict?: Maybe<Code_Submissions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Gift_CardsArgs = {
  objects: Array<Gift_Cards_Insert_Input>;
  on_conflict?: Maybe<Gift_Cards_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Gift_Cards_OneArgs = {
  object: Gift_Cards_Insert_Input;
  on_conflict?: Maybe<Gift_Cards_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_LessonsArgs = {
  objects: Array<Lessons_Insert_Input>;
  on_conflict?: Maybe<Lessons_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Lessons_OneArgs = {
  object: Lessons_Insert_Input;
  on_conflict?: Maybe<Lessons_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ProductsArgs = {
  objects: Array<Products_Insert_Input>;
  on_conflict?: Maybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Products_OneArgs = {
  object: Products_Insert_Input;
  on_conflict?: Maybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Related_LessonsArgs = {
  objects: Array<Related_Lessons_Insert_Input>;
  on_conflict?: Maybe<Related_Lessons_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Related_Lessons_OneArgs = {
  object: Related_Lessons_Insert_Input;
  on_conflict?: Maybe<Related_Lessons_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_SalesArgs = {
  objects: Array<Sales_Insert_Input>;
  on_conflict?: Maybe<Sales_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Sales_OneArgs = {
  object: Sales_Insert_Input;
  on_conflict?: Maybe<Sales_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Upgrade_Event_LogArgs = {
  objects: Array<Upgrade_Event_Log_Insert_Input>;
  on_conflict?: Maybe<Upgrade_Event_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Upgrade_Event_Log_OneArgs = {
  object: Upgrade_Event_Log_Insert_Input;
  on_conflict?: Maybe<Upgrade_Event_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_FeedbackArgs = {
  objects: Array<User_Feedback_Insert_Input>;
  on_conflict?: Maybe<User_Feedback_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Feedback_OneArgs = {
  object: User_Feedback_Insert_Input;
  on_conflict?: Maybe<User_Feedback_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: Maybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_Lessons_StatusArgs = {
  objects: Array<Users_Lessons_Status_Insert_Input>;
  on_conflict?: Maybe<Users_Lessons_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_Lessons_Status_OneArgs = {
  object: Users_Lessons_Status_Insert_Input;
  on_conflict?: Maybe<Users_Lessons_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: Maybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Link_ClicksArgs = {
  _set?: Maybe<Affiliate_Link_Clicks_Set_Input>;
  where: Affiliate_Link_Clicks_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Link_Clicks_By_PkArgs = {
  _set?: Maybe<Affiliate_Link_Clicks_Set_Input>;
  pk_columns: Affiliate_Link_Clicks_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Link_Clicks_ManyArgs = {
  updates: Array<Affiliate_Link_Clicks_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_PayoutsArgs = {
  _inc?: Maybe<Affiliate_Payouts_Inc_Input>;
  _set?: Maybe<Affiliate_Payouts_Set_Input>;
  where: Affiliate_Payouts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Payouts_By_PkArgs = {
  _inc?: Maybe<Affiliate_Payouts_Inc_Input>;
  _set?: Maybe<Affiliate_Payouts_Set_Input>;
  pk_columns: Affiliate_Payouts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Payouts_ManyArgs = {
  updates: Array<Affiliate_Payouts_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_SalesArgs = {
  _inc?: Maybe<Affiliate_Sales_Inc_Input>;
  _set?: Maybe<Affiliate_Sales_Set_Input>;
  where: Affiliate_Sales_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Affiliate_Sales_ManyArgs = {
  updates: Array<Affiliate_Sales_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Alternate_EmailsArgs = {
  _set?: Maybe<Alternate_Emails_Set_Input>;
  where: Alternate_Emails_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Alternate_Emails_By_PkArgs = {
  _set?: Maybe<Alternate_Emails_Set_Input>;
  pk_columns: Alternate_Emails_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Alternate_Emails_ManyArgs = {
  updates: Array<Alternate_Emails_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_CategoriesArgs = {
  _inc?: Maybe<Categories_Inc_Input>;
  _set?: Maybe<Categories_Set_Input>;
  where: Categories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Categories_By_PkArgs = {
  _inc?: Maybe<Categories_Inc_Input>;
  _set?: Maybe<Categories_Set_Input>;
  pk_columns: Categories_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Categories_ManyArgs = {
  updates: Array<Categories_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Checkout_Event_LogArgs = {
  _set?: Maybe<Checkout_Event_Log_Set_Input>;
  where: Checkout_Event_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Checkout_Event_Log_By_PkArgs = {
  _set?: Maybe<Checkout_Event_Log_Set_Input>;
  pk_columns: Checkout_Event_Log_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Checkout_Event_Log_ManyArgs = {
  updates: Array<Checkout_Event_Log_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Code_DraftsArgs = {
  _set?: Maybe<Code_Drafts_Set_Input>;
  where: Code_Drafts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Code_Drafts_By_PkArgs = {
  _set?: Maybe<Code_Drafts_Set_Input>;
  pk_columns: Code_Drafts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Code_Drafts_ManyArgs = {
  updates: Array<Code_Drafts_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Code_SubmissionsArgs = {
  _append?: Maybe<Code_Submissions_Append_Input>;
  _delete_at_path?: Maybe<Code_Submissions_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Code_Submissions_Delete_Elem_Input>;
  _delete_key?: Maybe<Code_Submissions_Delete_Key_Input>;
  _inc?: Maybe<Code_Submissions_Inc_Input>;
  _prepend?: Maybe<Code_Submissions_Prepend_Input>;
  _set?: Maybe<Code_Submissions_Set_Input>;
  where: Code_Submissions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Code_Submissions_By_PkArgs = {
  _append?: Maybe<Code_Submissions_Append_Input>;
  _delete_at_path?: Maybe<Code_Submissions_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Code_Submissions_Delete_Elem_Input>;
  _delete_key?: Maybe<Code_Submissions_Delete_Key_Input>;
  _inc?: Maybe<Code_Submissions_Inc_Input>;
  _prepend?: Maybe<Code_Submissions_Prepend_Input>;
  _set?: Maybe<Code_Submissions_Set_Input>;
  pk_columns: Code_Submissions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Code_Submissions_ManyArgs = {
  updates: Array<Code_Submissions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Gift_CardsArgs = {
  _inc?: Maybe<Gift_Cards_Inc_Input>;
  _set?: Maybe<Gift_Cards_Set_Input>;
  where: Gift_Cards_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Gift_Cards_By_PkArgs = {
  _inc?: Maybe<Gift_Cards_Inc_Input>;
  _set?: Maybe<Gift_Cards_Set_Input>;
  pk_columns: Gift_Cards_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Gift_Cards_ManyArgs = {
  updates: Array<Gift_Cards_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_LessonsArgs = {
  _inc?: Maybe<Lessons_Inc_Input>;
  _set?: Maybe<Lessons_Set_Input>;
  where: Lessons_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Lessons_By_PkArgs = {
  _inc?: Maybe<Lessons_Inc_Input>;
  _set?: Maybe<Lessons_Set_Input>;
  pk_columns: Lessons_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Lessons_ManyArgs = {
  updates: Array<Lessons_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ProductsArgs = {
  _inc?: Maybe<Products_Inc_Input>;
  _set?: Maybe<Products_Set_Input>;
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Products_By_PkArgs = {
  _inc?: Maybe<Products_Inc_Input>;
  _set?: Maybe<Products_Set_Input>;
  pk_columns: Products_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Products_ManyArgs = {
  updates: Array<Products_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Related_LessonsArgs = {
  _set?: Maybe<Related_Lessons_Set_Input>;
  where: Related_Lessons_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Related_Lessons_By_PkArgs = {
  _set?: Maybe<Related_Lessons_Set_Input>;
  pk_columns: Related_Lessons_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Related_Lessons_ManyArgs = {
  updates: Array<Related_Lessons_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_SalesArgs = {
  _append?: Maybe<Sales_Append_Input>;
  _delete_at_path?: Maybe<Sales_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Sales_Delete_Elem_Input>;
  _delete_key?: Maybe<Sales_Delete_Key_Input>;
  _inc?: Maybe<Sales_Inc_Input>;
  _prepend?: Maybe<Sales_Prepend_Input>;
  _set?: Maybe<Sales_Set_Input>;
  where: Sales_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Sales_By_PkArgs = {
  _append?: Maybe<Sales_Append_Input>;
  _delete_at_path?: Maybe<Sales_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Sales_Delete_Elem_Input>;
  _delete_key?: Maybe<Sales_Delete_Key_Input>;
  _inc?: Maybe<Sales_Inc_Input>;
  _prepend?: Maybe<Sales_Prepend_Input>;
  _set?: Maybe<Sales_Set_Input>;
  pk_columns: Sales_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Sales_ManyArgs = {
  updates: Array<Sales_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Upgrade_Event_LogArgs = {
  _append?: Maybe<Upgrade_Event_Log_Append_Input>;
  _delete_at_path?: Maybe<Upgrade_Event_Log_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Upgrade_Event_Log_Delete_Elem_Input>;
  _delete_key?: Maybe<Upgrade_Event_Log_Delete_Key_Input>;
  _inc?: Maybe<Upgrade_Event_Log_Inc_Input>;
  _prepend?: Maybe<Upgrade_Event_Log_Prepend_Input>;
  _set?: Maybe<Upgrade_Event_Log_Set_Input>;
  where: Upgrade_Event_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Upgrade_Event_Log_By_PkArgs = {
  _append?: Maybe<Upgrade_Event_Log_Append_Input>;
  _delete_at_path?: Maybe<Upgrade_Event_Log_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Upgrade_Event_Log_Delete_Elem_Input>;
  _delete_key?: Maybe<Upgrade_Event_Log_Delete_Key_Input>;
  _inc?: Maybe<Upgrade_Event_Log_Inc_Input>;
  _prepend?: Maybe<Upgrade_Event_Log_Prepend_Input>;
  _set?: Maybe<Upgrade_Event_Log_Set_Input>;
  pk_columns: Upgrade_Event_Log_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Upgrade_Event_Log_ManyArgs = {
  updates: Array<Upgrade_Event_Log_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_FeedbackArgs = {
  _set?: Maybe<User_Feedback_Set_Input>;
  where: User_Feedback_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Feedback_By_PkArgs = {
  _set?: Maybe<User_Feedback_Set_Input>;
  pk_columns: User_Feedback_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Feedback_ManyArgs = {
  updates: Array<User_Feedback_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _append?: Maybe<Users_Append_Input>;
  _delete_at_path?: Maybe<Users_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Users_Delete_Elem_Input>;
  _delete_key?: Maybe<Users_Delete_Key_Input>;
  _inc?: Maybe<Users_Inc_Input>;
  _prepend?: Maybe<Users_Prepend_Input>;
  _set?: Maybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _append?: Maybe<Users_Append_Input>;
  _delete_at_path?: Maybe<Users_Delete_At_Path_Input>;
  _delete_elem?: Maybe<Users_Delete_Elem_Input>;
  _delete_key?: Maybe<Users_Delete_Key_Input>;
  _inc?: Maybe<Users_Inc_Input>;
  _prepend?: Maybe<Users_Prepend_Input>;
  _set?: Maybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_Lessons_StatusArgs = {
  _inc?: Maybe<Users_Lessons_Status_Inc_Input>;
  _set?: Maybe<Users_Lessons_Status_Set_Input>;
  where: Users_Lessons_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_Lessons_Status_By_PkArgs = {
  _inc?: Maybe<Users_Lessons_Status_Inc_Input>;
  _set?: Maybe<Users_Lessons_Status_Set_Input>;
  pk_columns: Users_Lessons_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_Lessons_Status_ManyArgs = {
  updates: Array<Users_Lessons_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: Maybe<Scalars['numeric']>;
  _gt?: Maybe<Scalars['numeric']>;
  _gte?: Maybe<Scalars['numeric']>;
  _in?: Maybe<Array<Scalars['numeric']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['numeric']>;
  _lte?: Maybe<Scalars['numeric']>;
  _neq?: Maybe<Scalars['numeric']>;
  _nin?: Maybe<Array<Scalars['numeric']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** columns and relationships of "products" */
export type Products = {
  __typename?: 'products';
  /** An object relationship */
  associatedProduct?: Maybe<Products>;
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt: Scalars['timestamptz'];
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  isAdditionalSupportPrice: Scalars['Boolean'];
  productAccessDays: Scalars['Int'];
  status: Scalars['String'];
  stripePriceId: Scalars['String'];
  stripeProductId: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
};

/** aggregated selection of "products" */
export type Products_Aggregate = {
  __typename?: 'products_aggregate';
  aggregate?: Maybe<Products_Aggregate_Fields>;
  nodes: Array<Products>;
};

/** aggregate fields of "products" */
export type Products_Aggregate_Fields = {
  __typename?: 'products_aggregate_fields';
  avg?: Maybe<Products_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Products_Max_Fields>;
  min?: Maybe<Products_Min_Fields>;
  stddev?: Maybe<Products_Stddev_Fields>;
  stddev_pop?: Maybe<Products_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Products_Stddev_Samp_Fields>;
  sum?: Maybe<Products_Sum_Fields>;
  var_pop?: Maybe<Products_Var_Pop_Fields>;
  var_samp?: Maybe<Products_Var_Samp_Fields>;
  variance?: Maybe<Products_Variance_Fields>;
};


/** aggregate fields of "products" */
export type Products_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Products_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Products_Avg_Fields = {
  __typename?: 'products_avg_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "products". All fields are combined with a logical 'AND'. */
export type Products_Bool_Exp = {
  _and?: Maybe<Array<Products_Bool_Exp>>;
  _not?: Maybe<Products_Bool_Exp>;
  _or?: Maybe<Array<Products_Bool_Exp>>;
  associatedProduct?: Maybe<Products_Bool_Exp>;
  associatedProductId?: Maybe<Uuid_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  displayDescription?: Maybe<String_Comparison_Exp>;
  displayLengthDescription?: Maybe<String_Comparison_Exp>;
  displayTitle?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  isAdditionalSupportPrice?: Maybe<Boolean_Comparison_Exp>;
  productAccessDays?: Maybe<Int_Comparison_Exp>;
  status?: Maybe<String_Comparison_Exp>;
  stripePriceId?: Maybe<String_Comparison_Exp>;
  stripeProductId?: Maybe<String_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "products" */
export enum Products_Constraint {
  /** unique or primary key constraint on columns "id" */
  ProductsPkey = 'products_pkey'
}

/** input type for incrementing numeric columns in table "products" */
export type Products_Inc_Input = {
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "products" */
export type Products_Insert_Input = {
  associatedProduct?: Maybe<Products_Obj_Rel_Insert_Input>;
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  isAdditionalSupportPrice?: Maybe<Scalars['Boolean']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Products_Max_Fields = {
  __typename?: 'products_max_fields';
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Products_Min_Fields = {
  __typename?: 'products_min_fields';
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "products" */
export type Products_Mutation_Response = {
  __typename?: 'products_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Products>;
};

/** input type for inserting object relation for remote table "products" */
export type Products_Obj_Rel_Insert_Input = {
  data: Products_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Products_On_Conflict>;
};

/** on_conflict condition type for table "products" */
export type Products_On_Conflict = {
  constraint: Products_Constraint;
  update_columns: Array<Products_Update_Column>;
  where?: Maybe<Products_Bool_Exp>;
};

/** Ordering options when selecting data from "products". */
export type Products_Order_By = {
  associatedProduct?: Maybe<Products_Order_By>;
  associatedProductId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  displayDescription?: Maybe<Order_By>;
  displayLengthDescription?: Maybe<Order_By>;
  displayTitle?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  isAdditionalSupportPrice?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** primary key columns input for table: products */
export type Products_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "products" */
export enum Products_Select_Column {
  /** column name */
  AssociatedProductId = 'associatedProductId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DisplayDescription = 'displayDescription',
  /** column name */
  DisplayLengthDescription = 'displayLengthDescription',
  /** column name */
  DisplayTitle = 'displayTitle',
  /** column name */
  Id = 'id',
  /** column name */
  IsAdditionalSupportPrice = 'isAdditionalSupportPrice',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  Status = 'status',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "products" */
export type Products_Set_Input = {
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  isAdditionalSupportPrice?: Maybe<Scalars['Boolean']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Products_Stddev_Fields = {
  __typename?: 'products_stddev_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Products_Stddev_Pop_Fields = {
  __typename?: 'products_stddev_pop_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Products_Stddev_Samp_Fields = {
  __typename?: 'products_stddev_samp_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** Streaming cursor of the table "products" */
export type Products_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Products_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Products_Stream_Cursor_Value_Input = {
  associatedProductId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  displayDescription?: Maybe<Scalars['String']>;
  displayLengthDescription?: Maybe<Scalars['String']>;
  displayTitle?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  isAdditionalSupportPrice?: Maybe<Scalars['Boolean']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate sum on columns */
export type Products_Sum_Fields = {
  __typename?: 'products_sum_fields';
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** update columns of table "products" */
export enum Products_Update_Column {
  /** column name */
  AssociatedProductId = 'associatedProductId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DisplayDescription = 'displayDescription',
  /** column name */
  DisplayLengthDescription = 'displayLengthDescription',
  /** column name */
  DisplayTitle = 'displayTitle',
  /** column name */
  Id = 'id',
  /** column name */
  IsAdditionalSupportPrice = 'isAdditionalSupportPrice',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  Status = 'status',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Products_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Products_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Products_Set_Input>;
  /** filter the rows which have to be updated */
  where: Products_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Products_Var_Pop_Fields = {
  __typename?: 'products_var_pop_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Products_Var_Samp_Fields = {
  __typename?: 'products_var_samp_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Products_Variance_Fields = {
  __typename?: 'products_variance_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "affiliate_link_clicks" */
  affiliate_link_clicks: Array<Affiliate_Link_Clicks>;
  /** fetch aggregated fields from the table: "affiliate_link_clicks" */
  affiliate_link_clicks_aggregate: Affiliate_Link_Clicks_Aggregate;
  /** fetch data from the table: "affiliate_link_clicks" using primary key columns */
  affiliate_link_clicks_by_pk?: Maybe<Affiliate_Link_Clicks>;
  /** fetch data from the table: "affiliate_payouts" */
  affiliate_payouts: Array<Affiliate_Payouts>;
  /** fetch aggregated fields from the table: "affiliate_payouts" */
  affiliate_payouts_aggregate: Affiliate_Payouts_Aggregate;
  /** fetch data from the table: "affiliate_payouts" using primary key columns */
  affiliate_payouts_by_pk?: Maybe<Affiliate_Payouts>;
  /** fetch data from the table: "affiliate_referral_click_counts" */
  affiliate_referral_click_counts: Array<Affiliate_Referral_Click_Counts>;
  /** fetch aggregated fields from the table: "affiliate_referral_click_counts" */
  affiliate_referral_click_counts_aggregate: Affiliate_Referral_Click_Counts_Aggregate;
  /** fetch data from the table: "affiliate_sales" */
  affiliate_sales: Array<Affiliate_Sales>;
  /** fetch aggregated fields from the table: "affiliate_sales" */
  affiliate_sales_aggregate: Affiliate_Sales_Aggregate;
  /** fetch data from the table: "alternate_emails" */
  alternate_emails: Array<Alternate_Emails>;
  /** fetch aggregated fields from the table: "alternate_emails" */
  alternate_emails_aggregate: Alternate_Emails_Aggregate;
  /** fetch data from the table: "alternate_emails" using primary key columns */
  alternate_emails_by_pk?: Maybe<Alternate_Emails>;
  /** fetch data from the table: "categories" */
  categories: Array<Categories>;
  /** fetch aggregated fields from the table: "categories" */
  categories_aggregate: Categories_Aggregate;
  /** fetch data from the table: "categories" using primary key columns */
  categories_by_pk?: Maybe<Categories>;
  /** fetch data from the table: "checkout_event_log" */
  checkout_event_log: Array<Checkout_Event_Log>;
  /** fetch aggregated fields from the table: "checkout_event_log" */
  checkout_event_log_aggregate: Checkout_Event_Log_Aggregate;
  /** fetch data from the table: "checkout_event_log" using primary key columns */
  checkout_event_log_by_pk?: Maybe<Checkout_Event_Log>;
  /** fetch data from the table: "code_drafts" */
  code_drafts: Array<Code_Drafts>;
  /** fetch aggregated fields from the table: "code_drafts" */
  code_drafts_aggregate: Code_Drafts_Aggregate;
  /** fetch data from the table: "code_drafts" using primary key columns */
  code_drafts_by_pk?: Maybe<Code_Drafts>;
  /** fetch data from the table: "code_submissions" */
  code_submissions: Array<Code_Submissions>;
  /** fetch aggregated fields from the table: "code_submissions" */
  code_submissions_aggregate: Code_Submissions_Aggregate;
  /** fetch data from the table: "code_submissions" using primary key columns */
  code_submissions_by_pk?: Maybe<Code_Submissions>;
  /** fetch data from the table: "gift_cards" */
  gift_cards: Array<Gift_Cards>;
  /** fetch aggregated fields from the table: "gift_cards" */
  gift_cards_aggregate: Gift_Cards_Aggregate;
  /** fetch data from the table: "gift_cards" using primary key columns */
  gift_cards_by_pk?: Maybe<Gift_Cards>;
  /** An array relationship */
  lessons: Array<Lessons>;
  /** An aggregate relationship */
  lessons_aggregate: Lessons_Aggregate;
  /** fetch data from the table: "lessons" using primary key columns */
  lessons_by_pk?: Maybe<Lessons>;
  /** fetch data from the table: "products" */
  products: Array<Products>;
  /** fetch aggregated fields from the table: "products" */
  products_aggregate: Products_Aggregate;
  /** fetch data from the table: "products" using primary key columns */
  products_by_pk?: Maybe<Products>;
  /** fetch data from the table: "related_lessons" */
  related_lessons: Array<Related_Lessons>;
  /** fetch aggregated fields from the table: "related_lessons" */
  related_lessons_aggregate: Related_Lessons_Aggregate;
  /** fetch data from the table: "related_lessons" using primary key columns */
  related_lessons_by_pk?: Maybe<Related_Lessons>;
  /** An array relationship */
  sales: Array<Sales>;
  /** An aggregate relationship */
  sales_aggregate: Sales_Aggregate;
  /** fetch data from the table: "sales" using primary key columns */
  sales_by_pk?: Maybe<Sales>;
  /** fetch data from the table: "upgrade_event_log" */
  upgrade_event_log: Array<Upgrade_Event_Log>;
  /** fetch aggregated fields from the table: "upgrade_event_log" */
  upgrade_event_log_aggregate: Upgrade_Event_Log_Aggregate;
  /** fetch data from the table: "upgrade_event_log" using primary key columns */
  upgrade_event_log_by_pk?: Maybe<Upgrade_Event_Log>;
  /** fetch data from the table: "user_feedback" */
  user_feedback: Array<User_Feedback>;
  /** fetch aggregated fields from the table: "user_feedback" */
  user_feedback_aggregate: User_Feedback_Aggregate;
  /** fetch data from the table: "user_feedback" using primary key columns */
  user_feedback_by_pk?: Maybe<User_Feedback>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table: "users_lessons_status" */
  users_lessons_status: Array<Users_Lessons_Status>;
  /** fetch aggregated fields from the table: "users_lessons_status" */
  users_lessons_status_aggregate: Users_Lessons_Status_Aggregate;
  /** fetch data from the table: "users_lessons_status" using primary key columns */
  users_lessons_status_by_pk?: Maybe<Users_Lessons_Status>;
};


export type Query_RootAffiliate_Link_ClicksArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


export type Query_RootAffiliate_Link_Clicks_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


export type Query_RootAffiliate_Link_Clicks_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootAffiliate_PayoutsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


export type Query_RootAffiliate_Payouts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


export type Query_RootAffiliate_Payouts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootAffiliate_Referral_Click_CountsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


export type Query_RootAffiliate_Referral_Click_Counts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


export type Query_RootAffiliate_SalesArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


export type Query_RootAffiliate_Sales_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


export type Query_RootAlternate_EmailsArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


export type Query_RootAlternate_Emails_AggregateArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


export type Query_RootAlternate_Emails_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootCategoriesArgs = {
  distinct_on?: Maybe<Array<Categories_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Categories_Order_By>>;
  where?: Maybe<Categories_Bool_Exp>;
};


export type Query_RootCategories_AggregateArgs = {
  distinct_on?: Maybe<Array<Categories_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Categories_Order_By>>;
  where?: Maybe<Categories_Bool_Exp>;
};


export type Query_RootCategories_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootCheckout_Event_LogArgs = {
  distinct_on?: Maybe<Array<Checkout_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Checkout_Event_Log_Order_By>>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};


export type Query_RootCheckout_Event_Log_AggregateArgs = {
  distinct_on?: Maybe<Array<Checkout_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Checkout_Event_Log_Order_By>>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};


export type Query_RootCheckout_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootCode_DraftsArgs = {
  distinct_on?: Maybe<Array<Code_Drafts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Drafts_Order_By>>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};


export type Query_RootCode_Drafts_AggregateArgs = {
  distinct_on?: Maybe<Array<Code_Drafts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Drafts_Order_By>>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};


export type Query_RootCode_Drafts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootCode_SubmissionsArgs = {
  distinct_on?: Maybe<Array<Code_Submissions_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Submissions_Order_By>>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};


export type Query_RootCode_Submissions_AggregateArgs = {
  distinct_on?: Maybe<Array<Code_Submissions_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Submissions_Order_By>>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};


export type Query_RootCode_Submissions_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootGift_CardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


export type Query_RootGift_Cards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


export type Query_RootGift_Cards_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootLessonsArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


export type Query_RootLessons_AggregateArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


export type Query_RootLessons_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootProductsArgs = {
  distinct_on?: Maybe<Array<Products_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Products_Order_By>>;
  where?: Maybe<Products_Bool_Exp>;
};


export type Query_RootProducts_AggregateArgs = {
  distinct_on?: Maybe<Array<Products_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Products_Order_By>>;
  where?: Maybe<Products_Bool_Exp>;
};


export type Query_RootProducts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootRelated_LessonsArgs = {
  distinct_on?: Maybe<Array<Related_Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Related_Lessons_Order_By>>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};


export type Query_RootRelated_Lessons_AggregateArgs = {
  distinct_on?: Maybe<Array<Related_Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Related_Lessons_Order_By>>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};


export type Query_RootRelated_Lessons_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootSalesArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


export type Query_RootSales_AggregateArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


export type Query_RootSales_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootUpgrade_Event_LogArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


export type Query_RootUpgrade_Event_Log_AggregateArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


export type Query_RootUpgrade_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootUser_FeedbackArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


export type Query_RootUser_Feedback_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


export type Query_RootUser_Feedback_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Query_RootUsersArgs = {
  distinct_on?: Maybe<Array<Users_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Order_By>>;
  where?: Maybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: Maybe<Array<Users_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Order_By>>;
  where?: Maybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['String'];
};


export type Query_RootUsers_Lessons_StatusArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


export type Query_RootUsers_Lessons_Status_AggregateArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


export type Query_RootUsers_Lessons_Status_By_PkArgs = {
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
};

/** columns and relationships of "related_lessons" */
export type Related_Lessons = {
  __typename?: 'related_lessons';
  categoryId: Scalars['uuid'];
  createdAt: Scalars['timestamptz'];
  id: Scalars['uuid'];
  lessonId: Scalars['uuid'];
  updatedAt: Scalars['timestamptz'];
};

/** aggregated selection of "related_lessons" */
export type Related_Lessons_Aggregate = {
  __typename?: 'related_lessons_aggregate';
  aggregate?: Maybe<Related_Lessons_Aggregate_Fields>;
  nodes: Array<Related_Lessons>;
};

/** aggregate fields of "related_lessons" */
export type Related_Lessons_Aggregate_Fields = {
  __typename?: 'related_lessons_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Related_Lessons_Max_Fields>;
  min?: Maybe<Related_Lessons_Min_Fields>;
};


/** aggregate fields of "related_lessons" */
export type Related_Lessons_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Related_Lessons_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "related_lessons". All fields are combined with a logical 'AND'. */
export type Related_Lessons_Bool_Exp = {
  _and?: Maybe<Array<Related_Lessons_Bool_Exp>>;
  _not?: Maybe<Related_Lessons_Bool_Exp>;
  _or?: Maybe<Array<Related_Lessons_Bool_Exp>>;
  categoryId?: Maybe<Uuid_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  lessonId?: Maybe<Uuid_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "related_lessons" */
export enum Related_Lessons_Constraint {
  /** unique or primary key constraint on columns "id" */
  RelatedLessonsPkey = 'related_lessons_pkey'
}

/** input type for inserting data into table "related_lessons" */
export type Related_Lessons_Insert_Input = {
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Related_Lessons_Max_Fields = {
  __typename?: 'related_lessons_max_fields';
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Related_Lessons_Min_Fields = {
  __typename?: 'related_lessons_min_fields';
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "related_lessons" */
export type Related_Lessons_Mutation_Response = {
  __typename?: 'related_lessons_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Related_Lessons>;
};

/** on_conflict condition type for table "related_lessons" */
export type Related_Lessons_On_Conflict = {
  constraint: Related_Lessons_Constraint;
  update_columns: Array<Related_Lessons_Update_Column>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};

/** Ordering options when selecting data from "related_lessons". */
export type Related_Lessons_Order_By = {
  categoryId?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  lessonId?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** primary key columns input for table: related_lessons */
export type Related_Lessons_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "related_lessons" */
export enum Related_Lessons_Select_Column {
  /** column name */
  CategoryId = 'categoryId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "related_lessons" */
export type Related_Lessons_Set_Input = {
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** Streaming cursor of the table "related_lessons" */
export type Related_Lessons_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Related_Lessons_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Related_Lessons_Stream_Cursor_Value_Input = {
  categoryId?: Maybe<Scalars['uuid']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  lessonId?: Maybe<Scalars['uuid']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "related_lessons" */
export enum Related_Lessons_Update_Column {
  /** column name */
  CategoryId = 'categoryId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Related_Lessons_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Related_Lessons_Set_Input>;
  /** filter the rows which have to be updated */
  where: Related_Lessons_Bool_Exp;
};

/** columns and relationships of "sales" */
export type Sales = {
  __typename?: 'sales';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  /** An object relationship */
  affiliateLinkClick?: Maybe<Affiliate_Link_Clicks>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  affiliatePayout?: Maybe<Affiliate_Payouts>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  /** An object relationship */
  affiliateUser?: Maybe<Users>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt: Scalars['timestamptz'];
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  /** An array relationship */
  giftCards: Array<Gift_Cards>;
  /** An aggregate relationship */
  giftCards_aggregate: Gift_Cards_Aggregate;
  id: Scalars['uuid'];
  items?: Maybe<Scalars['jsonb']>;
  message?: Maybe<Scalars['String']>;
  originalPrice: Scalars['numeric'];
  /** An object relationship */
  payingUser: Users;
  payingUserId: Scalars['String'];
  paymentProcessor: Scalars['String'];
  /** An object relationship */
  product?: Maybe<Products>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status: Scalars['String'];
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
  type?: Maybe<Scalars['String']>;
  updatedAt: Scalars['timestamptz'];
  /** An array relationship */
  upgradeEventLogs: Array<Upgrade_Event_Log>;
  /** An aggregate relationship */
  upgradeEventLogs_aggregate: Upgrade_Event_Log_Aggregate;
};


/** columns and relationships of "sales" */
export type SalesGiftCardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "sales" */
export type SalesGiftCards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "sales" */
export type SalesItemsArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "sales" */
export type SalesTransactionObjectArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "sales" */
export type SalesUpgradeEventLogsArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


/** columns and relationships of "sales" */
export type SalesUpgradeEventLogs_AggregateArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};

/** aggregated selection of "sales" */
export type Sales_Aggregate = {
  __typename?: 'sales_aggregate';
  aggregate?: Maybe<Sales_Aggregate_Fields>;
  nodes: Array<Sales>;
};

export type Sales_Aggregate_Bool_Exp = {
  count?: Maybe<Sales_Aggregate_Bool_Exp_Count>;
};

export type Sales_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Sales_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Sales_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "sales" */
export type Sales_Aggregate_Fields = {
  __typename?: 'sales_aggregate_fields';
  avg?: Maybe<Sales_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Sales_Max_Fields>;
  min?: Maybe<Sales_Min_Fields>;
  stddev?: Maybe<Sales_Stddev_Fields>;
  stddev_pop?: Maybe<Sales_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Sales_Stddev_Samp_Fields>;
  sum?: Maybe<Sales_Sum_Fields>;
  var_pop?: Maybe<Sales_Var_Pop_Fields>;
  var_samp?: Maybe<Sales_Var_Samp_Fields>;
  variance?: Maybe<Sales_Variance_Fields>;
};


/** aggregate fields of "sales" */
export type Sales_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Sales_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "sales" */
export type Sales_Aggregate_Order_By = {
  avg?: Maybe<Sales_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Sales_Max_Order_By>;
  min?: Maybe<Sales_Min_Order_By>;
  stddev?: Maybe<Sales_Stddev_Order_By>;
  stddev_pop?: Maybe<Sales_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Sales_Stddev_Samp_Order_By>;
  sum?: Maybe<Sales_Sum_Order_By>;
  var_pop?: Maybe<Sales_Var_Pop_Order_By>;
  var_samp?: Maybe<Sales_Var_Samp_Order_By>;
  variance?: Maybe<Sales_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Sales_Append_Input = {
  items?: Maybe<Scalars['jsonb']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "sales" */
export type Sales_Arr_Rel_Insert_Input = {
  data: Array<Sales_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Sales_On_Conflict>;
};

/** aggregate avg on columns */
export type Sales_Avg_Fields = {
  __typename?: 'sales_avg_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "sales" */
export type Sales_Avg_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "sales". All fields are combined with a logical 'AND'. */
export type Sales_Bool_Exp = {
  _and?: Maybe<Array<Sales_Bool_Exp>>;
  _not?: Maybe<Sales_Bool_Exp>;
  _or?: Maybe<Array<Sales_Bool_Exp>>;
  affiliateAmountEarned?: Maybe<Numeric_Comparison_Exp>;
  affiliateLinkClick?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
  affiliateLinkClickId?: Maybe<Uuid_Comparison_Exp>;
  affiliatePayout?: Maybe<Affiliate_Payouts_Bool_Exp>;
  affiliatePayoutId?: Maybe<Uuid_Comparison_Exp>;
  affiliatePayoutStatus?: Maybe<String_Comparison_Exp>;
  affiliateUser?: Maybe<Users_Bool_Exp>;
  affiliateUserId?: Maybe<String_Comparison_Exp>;
  amountPaid?: Maybe<Numeric_Comparison_Exp>;
  amountRefunded?: Maybe<Numeric_Comparison_Exp>;
  coupon?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  discountAmount?: Maybe<String_Comparison_Exp>;
  discountType?: Maybe<String_Comparison_Exp>;
  giftCards?: Maybe<Gift_Cards_Bool_Exp>;
  giftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Bool_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  items?: Maybe<Jsonb_Comparison_Exp>;
  message?: Maybe<String_Comparison_Exp>;
  originalPrice?: Maybe<Numeric_Comparison_Exp>;
  payingUser?: Maybe<Users_Bool_Exp>;
  payingUserId?: Maybe<String_Comparison_Exp>;
  paymentProcessor?: Maybe<String_Comparison_Exp>;
  product?: Maybe<Products_Bool_Exp>;
  purchasedProductId?: Maybe<Uuid_Comparison_Exp>;
  refundedAt?: Maybe<Timestamptz_Comparison_Exp>;
  status?: Maybe<String_Comparison_Exp>;
  stripeCustomerEmail?: Maybe<String_Comparison_Exp>;
  stripeCustomerId?: Maybe<String_Comparison_Exp>;
  stripePaymentStatus?: Maybe<String_Comparison_Exp>;
  stripePriceId?: Maybe<String_Comparison_Exp>;
  stripeProductId?: Maybe<String_Comparison_Exp>;
  stripeSessionId?: Maybe<String_Comparison_Exp>;
  transactionObject?: Maybe<Jsonb_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  upgradeEventLogs?: Maybe<Upgrade_Event_Log_Bool_Exp>;
  upgradeEventLogs_aggregate?: Maybe<Upgrade_Event_Log_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "sales" */
export enum Sales_Constraint {
  /** unique or primary key constraint on columns "id" */
  SalesPkey = 'sales_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Sales_Delete_At_Path_Input = {
  items?: Maybe<Array<Scalars['String']>>;
  transactionObject?: Maybe<Array<Scalars['String']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type Sales_Delete_Elem_Input = {
  items?: Maybe<Scalars['Int']>;
  transactionObject?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Sales_Delete_Key_Input = {
  items?: Maybe<Scalars['String']>;
  transactionObject?: Maybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "sales" */
export type Sales_Inc_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  originalPrice?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "sales" */
export type Sales_Insert_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateLinkClick?: Maybe<Affiliate_Link_Clicks_Obj_Rel_Insert_Input>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  affiliatePayout?: Maybe<Affiliate_Payouts_Obj_Rel_Insert_Input>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  affiliateUser?: Maybe<Users_Obj_Rel_Insert_Input>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  giftCards?: Maybe<Gift_Cards_Arr_Rel_Insert_Input>;
  id?: Maybe<Scalars['uuid']>;
  items?: Maybe<Scalars['jsonb']>;
  message?: Maybe<Scalars['String']>;
  originalPrice?: Maybe<Scalars['numeric']>;
  payingUser?: Maybe<Users_Obj_Rel_Insert_Input>;
  payingUserId?: Maybe<Scalars['String']>;
  paymentProcessor?: Maybe<Scalars['String']>;
  product?: Maybe<Products_Obj_Rel_Insert_Input>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<Scalars['String']>;
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  upgradeEventLogs?: Maybe<Upgrade_Event_Log_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Sales_Max_Fields = {
  __typename?: 'sales_max_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  message?: Maybe<Scalars['String']>;
  originalPrice?: Maybe<Scalars['numeric']>;
  payingUserId?: Maybe<Scalars['String']>;
  paymentProcessor?: Maybe<Scalars['String']>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<Scalars['String']>;
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "sales" */
export type Sales_Max_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateLinkClickId?: Maybe<Order_By>;
  affiliatePayoutId?: Maybe<Order_By>;
  affiliatePayoutStatus?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  coupon?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  discountAmount?: Maybe<Order_By>;
  discountType?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  message?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
  payingUserId?: Maybe<Order_By>;
  paymentProcessor?: Maybe<Order_By>;
  purchasedProductId?: Maybe<Order_By>;
  refundedAt?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripeCustomerEmail?: Maybe<Order_By>;
  stripeCustomerId?: Maybe<Order_By>;
  stripePaymentStatus?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  stripeSessionId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Sales_Min_Fields = {
  __typename?: 'sales_min_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  message?: Maybe<Scalars['String']>;
  originalPrice?: Maybe<Scalars['numeric']>;
  payingUserId?: Maybe<Scalars['String']>;
  paymentProcessor?: Maybe<Scalars['String']>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<Scalars['String']>;
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "sales" */
export type Sales_Min_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateLinkClickId?: Maybe<Order_By>;
  affiliatePayoutId?: Maybe<Order_By>;
  affiliatePayoutStatus?: Maybe<Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  coupon?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  discountAmount?: Maybe<Order_By>;
  discountType?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  message?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
  payingUserId?: Maybe<Order_By>;
  paymentProcessor?: Maybe<Order_By>;
  purchasedProductId?: Maybe<Order_By>;
  refundedAt?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripeCustomerEmail?: Maybe<Order_By>;
  stripeCustomerId?: Maybe<Order_By>;
  stripePaymentStatus?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  stripeSessionId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
};

/** response of any mutation on the table "sales" */
export type Sales_Mutation_Response = {
  __typename?: 'sales_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Sales>;
};

/** input type for inserting object relation for remote table "sales" */
export type Sales_Obj_Rel_Insert_Input = {
  data: Sales_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Sales_On_Conflict>;
};

/** on_conflict condition type for table "sales" */
export type Sales_On_Conflict = {
  constraint: Sales_Constraint;
  update_columns: Array<Sales_Update_Column>;
  where?: Maybe<Sales_Bool_Exp>;
};

/** Ordering options when selecting data from "sales". */
export type Sales_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  affiliateLinkClick?: Maybe<Affiliate_Link_Clicks_Order_By>;
  affiliateLinkClickId?: Maybe<Order_By>;
  affiliatePayout?: Maybe<Affiliate_Payouts_Order_By>;
  affiliatePayoutId?: Maybe<Order_By>;
  affiliatePayoutStatus?: Maybe<Order_By>;
  affiliateUser?: Maybe<Users_Order_By>;
  affiliateUserId?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  coupon?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  discountAmount?: Maybe<Order_By>;
  discountType?: Maybe<Order_By>;
  giftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Order_By>;
  id?: Maybe<Order_By>;
  items?: Maybe<Order_By>;
  message?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
  payingUser?: Maybe<Users_Order_By>;
  payingUserId?: Maybe<Order_By>;
  paymentProcessor?: Maybe<Order_By>;
  product?: Maybe<Products_Order_By>;
  purchasedProductId?: Maybe<Order_By>;
  refundedAt?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  stripeCustomerEmail?: Maybe<Order_By>;
  stripeCustomerId?: Maybe<Order_By>;
  stripePaymentStatus?: Maybe<Order_By>;
  stripePriceId?: Maybe<Order_By>;
  stripeProductId?: Maybe<Order_By>;
  stripeSessionId?: Maybe<Order_By>;
  transactionObject?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  upgradeEventLogs_aggregate?: Maybe<Upgrade_Event_Log_Aggregate_Order_By>;
};

/** primary key columns input for table: sales */
export type Sales_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Sales_Prepend_Input = {
  items?: Maybe<Scalars['jsonb']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "sales" */
export enum Sales_Select_Column {
  /** column name */
  AffiliateAmountEarned = 'affiliateAmountEarned',
  /** column name */
  AffiliateLinkClickId = 'affiliateLinkClickId',
  /** column name */
  AffiliatePayoutId = 'affiliatePayoutId',
  /** column name */
  AffiliatePayoutStatus = 'affiliatePayoutStatus',
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  AmountPaid = 'amountPaid',
  /** column name */
  AmountRefunded = 'amountRefunded',
  /** column name */
  Coupon = 'coupon',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DiscountAmount = 'discountAmount',
  /** column name */
  DiscountType = 'discountType',
  /** column name */
  Id = 'id',
  /** column name */
  Items = 'items',
  /** column name */
  Message = 'message',
  /** column name */
  OriginalPrice = 'originalPrice',
  /** column name */
  PayingUserId = 'payingUserId',
  /** column name */
  PaymentProcessor = 'paymentProcessor',
  /** column name */
  PurchasedProductId = 'purchasedProductId',
  /** column name */
  RefundedAt = 'refundedAt',
  /** column name */
  Status = 'status',
  /** column name */
  StripeCustomerEmail = 'stripeCustomerEmail',
  /** column name */
  StripeCustomerId = 'stripeCustomerId',
  /** column name */
  StripePaymentStatus = 'stripePaymentStatus',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  StripeSessionId = 'stripeSessionId',
  /** column name */
  TransactionObject = 'transactionObject',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "sales" */
export type Sales_Set_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  items?: Maybe<Scalars['jsonb']>;
  message?: Maybe<Scalars['String']>;
  originalPrice?: Maybe<Scalars['numeric']>;
  payingUserId?: Maybe<Scalars['String']>;
  paymentProcessor?: Maybe<Scalars['String']>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<Scalars['String']>;
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type Sales_Stddev_Fields = {
  __typename?: 'sales_stddev_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "sales" */
export type Sales_Stddev_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Sales_Stddev_Pop_Fields = {
  __typename?: 'sales_stddev_pop_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "sales" */
export type Sales_Stddev_Pop_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Sales_Stddev_Samp_Fields = {
  __typename?: 'sales_stddev_samp_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "sales" */
export type Sales_Stddev_Samp_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** Streaming cursor of the table "sales" */
export type Sales_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Sales_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Sales_Stream_Cursor_Value_Input = {
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  affiliateLinkClickId?: Maybe<Scalars['uuid']>;
  affiliatePayoutId?: Maybe<Scalars['uuid']>;
  affiliatePayoutStatus?: Maybe<Scalars['String']>;
  affiliateUserId?: Maybe<Scalars['String']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  coupon?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  discountAmount?: Maybe<Scalars['String']>;
  discountType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  items?: Maybe<Scalars['jsonb']>;
  message?: Maybe<Scalars['String']>;
  originalPrice?: Maybe<Scalars['numeric']>;
  payingUserId?: Maybe<Scalars['String']>;
  paymentProcessor?: Maybe<Scalars['String']>;
  purchasedProductId?: Maybe<Scalars['uuid']>;
  refundedAt?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<Scalars['String']>;
  stripeCustomerEmail?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  stripePaymentStatus?: Maybe<Scalars['String']>;
  stripePriceId?: Maybe<Scalars['String']>;
  stripeProductId?: Maybe<Scalars['String']>;
  stripeSessionId?: Maybe<Scalars['String']>;
  transactionObject?: Maybe<Scalars['jsonb']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
};

/** aggregate sum on columns */
export type Sales_Sum_Fields = {
  __typename?: 'sales_sum_fields';
  affiliateAmountEarned?: Maybe<Scalars['numeric']>;
  amountPaid?: Maybe<Scalars['numeric']>;
  amountRefunded?: Maybe<Scalars['numeric']>;
  originalPrice?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "sales" */
export type Sales_Sum_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** update columns of table "sales" */
export enum Sales_Update_Column {
  /** column name */
  AffiliateAmountEarned = 'affiliateAmountEarned',
  /** column name */
  AffiliateLinkClickId = 'affiliateLinkClickId',
  /** column name */
  AffiliatePayoutId = 'affiliatePayoutId',
  /** column name */
  AffiliatePayoutStatus = 'affiliatePayoutStatus',
  /** column name */
  AffiliateUserId = 'affiliateUserId',
  /** column name */
  AmountPaid = 'amountPaid',
  /** column name */
  AmountRefunded = 'amountRefunded',
  /** column name */
  Coupon = 'coupon',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DiscountAmount = 'discountAmount',
  /** column name */
  DiscountType = 'discountType',
  /** column name */
  Id = 'id',
  /** column name */
  Items = 'items',
  /** column name */
  Message = 'message',
  /** column name */
  OriginalPrice = 'originalPrice',
  /** column name */
  PayingUserId = 'payingUserId',
  /** column name */
  PaymentProcessor = 'paymentProcessor',
  /** column name */
  PurchasedProductId = 'purchasedProductId',
  /** column name */
  RefundedAt = 'refundedAt',
  /** column name */
  Status = 'status',
  /** column name */
  StripeCustomerEmail = 'stripeCustomerEmail',
  /** column name */
  StripeCustomerId = 'stripeCustomerId',
  /** column name */
  StripePaymentStatus = 'stripePaymentStatus',
  /** column name */
  StripePriceId = 'stripePriceId',
  /** column name */
  StripeProductId = 'stripeProductId',
  /** column name */
  StripeSessionId = 'stripeSessionId',
  /** column name */
  TransactionObject = 'transactionObject',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Sales_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: Maybe<Sales_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: Maybe<Sales_Delete_At_Path_Input>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _delete_elem?: Maybe<Sales_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: Maybe<Sales_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Sales_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: Maybe<Sales_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Sales_Set_Input>;
  /** filter the rows which have to be updated */
  where: Sales_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Sales_Var_Pop_Fields = {
  __typename?: 'sales_var_pop_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "sales" */
export type Sales_Var_Pop_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Sales_Var_Samp_Fields = {
  __typename?: 'sales_var_samp_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "sales" */
export type Sales_Var_Samp_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Sales_Variance_Fields = {
  __typename?: 'sales_variance_fields';
  affiliateAmountEarned?: Maybe<Scalars['Float']>;
  amountPaid?: Maybe<Scalars['Float']>;
  amountRefunded?: Maybe<Scalars['Float']>;
  originalPrice?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "sales" */
export type Sales_Variance_Order_By = {
  affiliateAmountEarned?: Maybe<Order_By>;
  amountPaid?: Maybe<Order_By>;
  amountRefunded?: Maybe<Order_By>;
  originalPrice?: Maybe<Order_By>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: Maybe<Scalars['String']>;
  _gt?: Maybe<Scalars['String']>;
  _gte?: Maybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: Maybe<Scalars['String']>;
  _in?: Maybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: Maybe<Scalars['String']>;
  _is_null?: Maybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: Maybe<Scalars['String']>;
  _lt?: Maybe<Scalars['String']>;
  _lte?: Maybe<Scalars['String']>;
  _neq?: Maybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: Maybe<Scalars['String']>;
  _nin?: Maybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: Maybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: Maybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: Maybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: Maybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: Maybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: Maybe<Scalars['String']>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "affiliate_link_clicks" */
  affiliate_link_clicks: Array<Affiliate_Link_Clicks>;
  /** fetch aggregated fields from the table: "affiliate_link_clicks" */
  affiliate_link_clicks_aggregate: Affiliate_Link_Clicks_Aggregate;
  /** fetch data from the table: "affiliate_link_clicks" using primary key columns */
  affiliate_link_clicks_by_pk?: Maybe<Affiliate_Link_Clicks>;
  /** fetch data from the table in a streaming manner: "affiliate_link_clicks" */
  affiliate_link_clicks_stream: Array<Affiliate_Link_Clicks>;
  /** fetch data from the table: "affiliate_payouts" */
  affiliate_payouts: Array<Affiliate_Payouts>;
  /** fetch aggregated fields from the table: "affiliate_payouts" */
  affiliate_payouts_aggregate: Affiliate_Payouts_Aggregate;
  /** fetch data from the table: "affiliate_payouts" using primary key columns */
  affiliate_payouts_by_pk?: Maybe<Affiliate_Payouts>;
  /** fetch data from the table in a streaming manner: "affiliate_payouts" */
  affiliate_payouts_stream: Array<Affiliate_Payouts>;
  /** fetch data from the table: "affiliate_referral_click_counts" */
  affiliate_referral_click_counts: Array<Affiliate_Referral_Click_Counts>;
  /** fetch aggregated fields from the table: "affiliate_referral_click_counts" */
  affiliate_referral_click_counts_aggregate: Affiliate_Referral_Click_Counts_Aggregate;
  /** fetch data from the table in a streaming manner: "affiliate_referral_click_counts" */
  affiliate_referral_click_counts_stream: Array<Affiliate_Referral_Click_Counts>;
  /** fetch data from the table: "affiliate_sales" */
  affiliate_sales: Array<Affiliate_Sales>;
  /** fetch aggregated fields from the table: "affiliate_sales" */
  affiliate_sales_aggregate: Affiliate_Sales_Aggregate;
  /** fetch data from the table in a streaming manner: "affiliate_sales" */
  affiliate_sales_stream: Array<Affiliate_Sales>;
  /** fetch data from the table: "alternate_emails" */
  alternate_emails: Array<Alternate_Emails>;
  /** fetch aggregated fields from the table: "alternate_emails" */
  alternate_emails_aggregate: Alternate_Emails_Aggregate;
  /** fetch data from the table: "alternate_emails" using primary key columns */
  alternate_emails_by_pk?: Maybe<Alternate_Emails>;
  /** fetch data from the table in a streaming manner: "alternate_emails" */
  alternate_emails_stream: Array<Alternate_Emails>;
  /** fetch data from the table: "categories" */
  categories: Array<Categories>;
  /** fetch aggregated fields from the table: "categories" */
  categories_aggregate: Categories_Aggregate;
  /** fetch data from the table: "categories" using primary key columns */
  categories_by_pk?: Maybe<Categories>;
  /** fetch data from the table in a streaming manner: "categories" */
  categories_stream: Array<Categories>;
  /** fetch data from the table: "checkout_event_log" */
  checkout_event_log: Array<Checkout_Event_Log>;
  /** fetch aggregated fields from the table: "checkout_event_log" */
  checkout_event_log_aggregate: Checkout_Event_Log_Aggregate;
  /** fetch data from the table: "checkout_event_log" using primary key columns */
  checkout_event_log_by_pk?: Maybe<Checkout_Event_Log>;
  /** fetch data from the table in a streaming manner: "checkout_event_log" */
  checkout_event_log_stream: Array<Checkout_Event_Log>;
  /** fetch data from the table: "code_drafts" */
  code_drafts: Array<Code_Drafts>;
  /** fetch aggregated fields from the table: "code_drafts" */
  code_drafts_aggregate: Code_Drafts_Aggregate;
  /** fetch data from the table: "code_drafts" using primary key columns */
  code_drafts_by_pk?: Maybe<Code_Drafts>;
  /** fetch data from the table in a streaming manner: "code_drafts" */
  code_drafts_stream: Array<Code_Drafts>;
  /** fetch data from the table: "code_submissions" */
  code_submissions: Array<Code_Submissions>;
  /** fetch aggregated fields from the table: "code_submissions" */
  code_submissions_aggregate: Code_Submissions_Aggregate;
  /** fetch data from the table: "code_submissions" using primary key columns */
  code_submissions_by_pk?: Maybe<Code_Submissions>;
  /** fetch data from the table in a streaming manner: "code_submissions" */
  code_submissions_stream: Array<Code_Submissions>;
  /** fetch data from the table: "gift_cards" */
  gift_cards: Array<Gift_Cards>;
  /** fetch aggregated fields from the table: "gift_cards" */
  gift_cards_aggregate: Gift_Cards_Aggregate;
  /** fetch data from the table: "gift_cards" using primary key columns */
  gift_cards_by_pk?: Maybe<Gift_Cards>;
  /** fetch data from the table in a streaming manner: "gift_cards" */
  gift_cards_stream: Array<Gift_Cards>;
  /** An array relationship */
  lessons: Array<Lessons>;
  /** An aggregate relationship */
  lessons_aggregate: Lessons_Aggregate;
  /** fetch data from the table: "lessons" using primary key columns */
  lessons_by_pk?: Maybe<Lessons>;
  /** fetch data from the table in a streaming manner: "lessons" */
  lessons_stream: Array<Lessons>;
  /** fetch data from the table: "products" */
  products: Array<Products>;
  /** fetch aggregated fields from the table: "products" */
  products_aggregate: Products_Aggregate;
  /** fetch data from the table: "products" using primary key columns */
  products_by_pk?: Maybe<Products>;
  /** fetch data from the table in a streaming manner: "products" */
  products_stream: Array<Products>;
  /** fetch data from the table: "related_lessons" */
  related_lessons: Array<Related_Lessons>;
  /** fetch aggregated fields from the table: "related_lessons" */
  related_lessons_aggregate: Related_Lessons_Aggregate;
  /** fetch data from the table: "related_lessons" using primary key columns */
  related_lessons_by_pk?: Maybe<Related_Lessons>;
  /** fetch data from the table in a streaming manner: "related_lessons" */
  related_lessons_stream: Array<Related_Lessons>;
  /** An array relationship */
  sales: Array<Sales>;
  /** An aggregate relationship */
  sales_aggregate: Sales_Aggregate;
  /** fetch data from the table: "sales" using primary key columns */
  sales_by_pk?: Maybe<Sales>;
  /** fetch data from the table in a streaming manner: "sales" */
  sales_stream: Array<Sales>;
  /** fetch data from the table: "upgrade_event_log" */
  upgrade_event_log: Array<Upgrade_Event_Log>;
  /** fetch aggregated fields from the table: "upgrade_event_log" */
  upgrade_event_log_aggregate: Upgrade_Event_Log_Aggregate;
  /** fetch data from the table: "upgrade_event_log" using primary key columns */
  upgrade_event_log_by_pk?: Maybe<Upgrade_Event_Log>;
  /** fetch data from the table in a streaming manner: "upgrade_event_log" */
  upgrade_event_log_stream: Array<Upgrade_Event_Log>;
  /** fetch data from the table: "user_feedback" */
  user_feedback: Array<User_Feedback>;
  /** fetch aggregated fields from the table: "user_feedback" */
  user_feedback_aggregate: User_Feedback_Aggregate;
  /** fetch data from the table: "user_feedback" using primary key columns */
  user_feedback_by_pk?: Maybe<User_Feedback>;
  /** fetch data from the table in a streaming manner: "user_feedback" */
  user_feedback_stream: Array<User_Feedback>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table: "users_lessons_status" */
  users_lessons_status: Array<Users_Lessons_Status>;
  /** fetch aggregated fields from the table: "users_lessons_status" */
  users_lessons_status_aggregate: Users_Lessons_Status_Aggregate;
  /** fetch data from the table: "users_lessons_status" using primary key columns */
  users_lessons_status_by_pk?: Maybe<Users_Lessons_Status>;
  /** fetch data from the table in a streaming manner: "users_lessons_status" */
  users_lessons_status_stream: Array<Users_Lessons_Status>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
};


export type Subscription_RootAffiliate_Link_ClicksArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


export type Subscription_RootAffiliate_Link_Clicks_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


export type Subscription_RootAffiliate_Link_Clicks_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootAffiliate_Link_Clicks_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Affiliate_Link_Clicks_Stream_Cursor_Input>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


export type Subscription_RootAffiliate_PayoutsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


export type Subscription_RootAffiliate_Payouts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


export type Subscription_RootAffiliate_Payouts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootAffiliate_Payouts_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Affiliate_Payouts_Stream_Cursor_Input>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


export type Subscription_RootAffiliate_Referral_Click_CountsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


export type Subscription_RootAffiliate_Referral_Click_Counts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


export type Subscription_RootAffiliate_Referral_Click_Counts_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Affiliate_Referral_Click_Counts_Stream_Cursor_Input>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


export type Subscription_RootAffiliate_SalesArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


export type Subscription_RootAffiliate_Sales_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


export type Subscription_RootAffiliate_Sales_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Affiliate_Sales_Stream_Cursor_Input>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


export type Subscription_RootAlternate_EmailsArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


export type Subscription_RootAlternate_Emails_AggregateArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


export type Subscription_RootAlternate_Emails_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootAlternate_Emails_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Alternate_Emails_Stream_Cursor_Input>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


export type Subscription_RootCategoriesArgs = {
  distinct_on?: Maybe<Array<Categories_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Categories_Order_By>>;
  where?: Maybe<Categories_Bool_Exp>;
};


export type Subscription_RootCategories_AggregateArgs = {
  distinct_on?: Maybe<Array<Categories_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Categories_Order_By>>;
  where?: Maybe<Categories_Bool_Exp>;
};


export type Subscription_RootCategories_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootCategories_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Categories_Stream_Cursor_Input>>;
  where?: Maybe<Categories_Bool_Exp>;
};


export type Subscription_RootCheckout_Event_LogArgs = {
  distinct_on?: Maybe<Array<Checkout_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Checkout_Event_Log_Order_By>>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};


export type Subscription_RootCheckout_Event_Log_AggregateArgs = {
  distinct_on?: Maybe<Array<Checkout_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Checkout_Event_Log_Order_By>>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};


export type Subscription_RootCheckout_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootCheckout_Event_Log_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Checkout_Event_Log_Stream_Cursor_Input>>;
  where?: Maybe<Checkout_Event_Log_Bool_Exp>;
};


export type Subscription_RootCode_DraftsArgs = {
  distinct_on?: Maybe<Array<Code_Drafts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Drafts_Order_By>>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};


export type Subscription_RootCode_Drafts_AggregateArgs = {
  distinct_on?: Maybe<Array<Code_Drafts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Drafts_Order_By>>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};


export type Subscription_RootCode_Drafts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootCode_Drafts_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Code_Drafts_Stream_Cursor_Input>>;
  where?: Maybe<Code_Drafts_Bool_Exp>;
};


export type Subscription_RootCode_SubmissionsArgs = {
  distinct_on?: Maybe<Array<Code_Submissions_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Submissions_Order_By>>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};


export type Subscription_RootCode_Submissions_AggregateArgs = {
  distinct_on?: Maybe<Array<Code_Submissions_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Code_Submissions_Order_By>>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};


export type Subscription_RootCode_Submissions_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootCode_Submissions_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Code_Submissions_Stream_Cursor_Input>>;
  where?: Maybe<Code_Submissions_Bool_Exp>;
};


export type Subscription_RootGift_CardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


export type Subscription_RootGift_Cards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


export type Subscription_RootGift_Cards_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootGift_Cards_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Gift_Cards_Stream_Cursor_Input>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


export type Subscription_RootLessonsArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


export type Subscription_RootLessons_AggregateArgs = {
  distinct_on?: Maybe<Array<Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Lessons_Order_By>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


export type Subscription_RootLessons_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootLessons_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Lessons_Stream_Cursor_Input>>;
  where?: Maybe<Lessons_Bool_Exp>;
};


export type Subscription_RootProductsArgs = {
  distinct_on?: Maybe<Array<Products_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Products_Order_By>>;
  where?: Maybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_AggregateArgs = {
  distinct_on?: Maybe<Array<Products_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Products_Order_By>>;
  where?: Maybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootProducts_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Products_Stream_Cursor_Input>>;
  where?: Maybe<Products_Bool_Exp>;
};


export type Subscription_RootRelated_LessonsArgs = {
  distinct_on?: Maybe<Array<Related_Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Related_Lessons_Order_By>>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};


export type Subscription_RootRelated_Lessons_AggregateArgs = {
  distinct_on?: Maybe<Array<Related_Lessons_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Related_Lessons_Order_By>>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};


export type Subscription_RootRelated_Lessons_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootRelated_Lessons_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Related_Lessons_Stream_Cursor_Input>>;
  where?: Maybe<Related_Lessons_Bool_Exp>;
};


export type Subscription_RootSalesArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


export type Subscription_RootSales_AggregateArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


export type Subscription_RootSales_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootSales_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Sales_Stream_Cursor_Input>>;
  where?: Maybe<Sales_Bool_Exp>;
};


export type Subscription_RootUpgrade_Event_LogArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


export type Subscription_RootUpgrade_Event_Log_AggregateArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


export type Subscription_RootUpgrade_Event_Log_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootUpgrade_Event_Log_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Upgrade_Event_Log_Stream_Cursor_Input>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


export type Subscription_RootUser_FeedbackArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


export type Subscription_RootUser_Feedback_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


export type Subscription_RootUser_Feedback_By_PkArgs = {
  id: Scalars['uuid'];
};


export type Subscription_RootUser_Feedback_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<User_Feedback_Stream_Cursor_Input>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: Maybe<Array<Users_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Order_By>>;
  where?: Maybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: Maybe<Array<Users_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Order_By>>;
  where?: Maybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['String'];
};


export type Subscription_RootUsers_Lessons_StatusArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


export type Subscription_RootUsers_Lessons_Status_AggregateArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


export type Subscription_RootUsers_Lessons_Status_By_PkArgs = {
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
};


export type Subscription_RootUsers_Lessons_Status_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Users_Lessons_Status_Stream_Cursor_Input>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<Maybe<Users_Stream_Cursor_Input>>;
  where?: Maybe<Users_Bool_Exp>;
};


/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: Maybe<Scalars['timestamptz']>;
  _gt?: Maybe<Scalars['timestamptz']>;
  _gte?: Maybe<Scalars['timestamptz']>;
  _in?: Maybe<Array<Scalars['timestamptz']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['timestamptz']>;
  _lte?: Maybe<Scalars['timestamptz']>;
  _neq?: Maybe<Scalars['timestamptz']>;
  _nin?: Maybe<Array<Scalars['timestamptz']>>;
};

/** columns and relationships of "upgrade_event_log" */
export type Upgrade_Event_Log = {
  __typename?: 'upgrade_event_log';
  createdAt: Scalars['timestamptz'];
  detailsObject?: Maybe<Scalars['jsonb']>;
  /** An object relationship */
  giftCard?: Maybe<Gift_Cards>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id: Scalars['uuid'];
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription: Scalars['String'];
  productName: Scalars['String'];
  productType: Scalars['String'];
  /** An object relationship */
  sale?: Maybe<Sales>;
  saleId?: Maybe<Scalars['uuid']>;
  type: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  userId: Scalars['String'];
};


/** columns and relationships of "upgrade_event_log" */
export type Upgrade_Event_LogDetailsObjectArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "upgrade_event_log" */
export type Upgrade_Event_Log_Aggregate = {
  __typename?: 'upgrade_event_log_aggregate';
  aggregate?: Maybe<Upgrade_Event_Log_Aggregate_Fields>;
  nodes: Array<Upgrade_Event_Log>;
};

export type Upgrade_Event_Log_Aggregate_Bool_Exp = {
  count?: Maybe<Upgrade_Event_Log_Aggregate_Bool_Exp_Count>;
};

export type Upgrade_Event_Log_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Upgrade_Event_Log_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "upgrade_event_log" */
export type Upgrade_Event_Log_Aggregate_Fields = {
  __typename?: 'upgrade_event_log_aggregate_fields';
  avg?: Maybe<Upgrade_Event_Log_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Upgrade_Event_Log_Max_Fields>;
  min?: Maybe<Upgrade_Event_Log_Min_Fields>;
  stddev?: Maybe<Upgrade_Event_Log_Stddev_Fields>;
  stddev_pop?: Maybe<Upgrade_Event_Log_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Upgrade_Event_Log_Stddev_Samp_Fields>;
  sum?: Maybe<Upgrade_Event_Log_Sum_Fields>;
  var_pop?: Maybe<Upgrade_Event_Log_Var_Pop_Fields>;
  var_samp?: Maybe<Upgrade_Event_Log_Var_Samp_Fields>;
  variance?: Maybe<Upgrade_Event_Log_Variance_Fields>;
};


/** aggregate fields of "upgrade_event_log" */
export type Upgrade_Event_Log_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "upgrade_event_log" */
export type Upgrade_Event_Log_Aggregate_Order_By = {
  avg?: Maybe<Upgrade_Event_Log_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Upgrade_Event_Log_Max_Order_By>;
  min?: Maybe<Upgrade_Event_Log_Min_Order_By>;
  stddev?: Maybe<Upgrade_Event_Log_Stddev_Order_By>;
  stddev_pop?: Maybe<Upgrade_Event_Log_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Upgrade_Event_Log_Stddev_Samp_Order_By>;
  sum?: Maybe<Upgrade_Event_Log_Sum_Order_By>;
  var_pop?: Maybe<Upgrade_Event_Log_Var_Pop_Order_By>;
  var_samp?: Maybe<Upgrade_Event_Log_Var_Samp_Order_By>;
  variance?: Maybe<Upgrade_Event_Log_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Upgrade_Event_Log_Append_Input = {
  detailsObject?: Maybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "upgrade_event_log" */
export type Upgrade_Event_Log_Arr_Rel_Insert_Input = {
  data: Array<Upgrade_Event_Log_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Upgrade_Event_Log_On_Conflict>;
};

/** aggregate avg on columns */
export type Upgrade_Event_Log_Avg_Fields = {
  __typename?: 'upgrade_event_log_avg_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Avg_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "upgrade_event_log". All fields are combined with a logical 'AND'. */
export type Upgrade_Event_Log_Bool_Exp = {
  _and?: Maybe<Array<Upgrade_Event_Log_Bool_Exp>>;
  _not?: Maybe<Upgrade_Event_Log_Bool_Exp>;
  _or?: Maybe<Array<Upgrade_Event_Log_Bool_Exp>>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  detailsObject?: Maybe<Jsonb_Comparison_Exp>;
  giftCard?: Maybe<Gift_Cards_Bool_Exp>;
  giftCardId?: Maybe<Uuid_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  note?: Maybe<String_Comparison_Exp>;
  productAccessDays?: Maybe<Int_Comparison_Exp>;
  productDescription?: Maybe<String_Comparison_Exp>;
  productName?: Maybe<String_Comparison_Exp>;
  productType?: Maybe<String_Comparison_Exp>;
  sale?: Maybe<Sales_Bool_Exp>;
  saleId?: Maybe<Uuid_Comparison_Exp>;
  type?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "upgrade_event_log" */
export enum Upgrade_Event_Log_Constraint {
  /** unique or primary key constraint on columns "id" */
  UpgradeEventLogPkey = 'upgrade_event_log_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Upgrade_Event_Log_Delete_At_Path_Input = {
  detailsObject?: Maybe<Array<Scalars['String']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type Upgrade_Event_Log_Delete_Elem_Input = {
  detailsObject?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Upgrade_Event_Log_Delete_Key_Input = {
  detailsObject?: Maybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "upgrade_event_log" */
export type Upgrade_Event_Log_Inc_Input = {
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "upgrade_event_log" */
export type Upgrade_Event_Log_Insert_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  detailsObject?: Maybe<Scalars['jsonb']>;
  giftCard?: Maybe<Gift_Cards_Obj_Rel_Insert_Input>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  sale?: Maybe<Sales_Obj_Rel_Insert_Input>;
  saleId?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Upgrade_Event_Log_Max_Fields = {
  __typename?: 'upgrade_event_log_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Max_Order_By = {
  createdAt?: Maybe<Order_By>;
  giftCardId?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  note?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  saleId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Upgrade_Event_Log_Min_Fields = {
  __typename?: 'upgrade_event_log_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Min_Order_By = {
  createdAt?: Maybe<Order_By>;
  giftCardId?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  note?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  saleId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** response of any mutation on the table "upgrade_event_log" */
export type Upgrade_Event_Log_Mutation_Response = {
  __typename?: 'upgrade_event_log_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Upgrade_Event_Log>;
};

/** on_conflict condition type for table "upgrade_event_log" */
export type Upgrade_Event_Log_On_Conflict = {
  constraint: Upgrade_Event_Log_Constraint;
  update_columns: Array<Upgrade_Event_Log_Update_Column>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};

/** Ordering options when selecting data from "upgrade_event_log". */
export type Upgrade_Event_Log_Order_By = {
  createdAt?: Maybe<Order_By>;
  detailsObject?: Maybe<Order_By>;
  giftCard?: Maybe<Gift_Cards_Order_By>;
  giftCardId?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  note?: Maybe<Order_By>;
  productAccessDays?: Maybe<Order_By>;
  productDescription?: Maybe<Order_By>;
  productName?: Maybe<Order_By>;
  productType?: Maybe<Order_By>;
  sale?: Maybe<Sales_Order_By>;
  saleId?: Maybe<Order_By>;
  type?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
};

/** primary key columns input for table: upgrade_event_log */
export type Upgrade_Event_Log_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Upgrade_Event_Log_Prepend_Input = {
  detailsObject?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "upgrade_event_log" */
export enum Upgrade_Event_Log_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DetailsObject = 'detailsObject',
  /** column name */
  GiftCardId = 'giftCardId',
  /** column name */
  Id = 'id',
  /** column name */
  Note = 'note',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  ProductDescription = 'productDescription',
  /** column name */
  ProductName = 'productName',
  /** column name */
  ProductType = 'productType',
  /** column name */
  SaleId = 'saleId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "upgrade_event_log" */
export type Upgrade_Event_Log_Set_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  detailsObject?: Maybe<Scalars['jsonb']>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Upgrade_Event_Log_Stddev_Fields = {
  __typename?: 'upgrade_event_log_stddev_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Stddev_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Upgrade_Event_Log_Stddev_Pop_Fields = {
  __typename?: 'upgrade_event_log_stddev_pop_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Stddev_Pop_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Upgrade_Event_Log_Stddev_Samp_Fields = {
  __typename?: 'upgrade_event_log_stddev_samp_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Stddev_Samp_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** Streaming cursor of the table "upgrade_event_log" */
export type Upgrade_Event_Log_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Upgrade_Event_Log_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Upgrade_Event_Log_Stream_Cursor_Value_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  detailsObject?: Maybe<Scalars['jsonb']>;
  giftCardId?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  note?: Maybe<Scalars['String']>;
  productAccessDays?: Maybe<Scalars['Int']>;
  productDescription?: Maybe<Scalars['String']>;
  productName?: Maybe<Scalars['String']>;
  productType?: Maybe<Scalars['String']>;
  saleId?: Maybe<Scalars['uuid']>;
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate sum on columns */
export type Upgrade_Event_Log_Sum_Fields = {
  __typename?: 'upgrade_event_log_sum_fields';
  productAccessDays?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Sum_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** update columns of table "upgrade_event_log" */
export enum Upgrade_Event_Log_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DetailsObject = 'detailsObject',
  /** column name */
  GiftCardId = 'giftCardId',
  /** column name */
  Id = 'id',
  /** column name */
  Note = 'note',
  /** column name */
  ProductAccessDays = 'productAccessDays',
  /** column name */
  ProductDescription = 'productDescription',
  /** column name */
  ProductName = 'productName',
  /** column name */
  ProductType = 'productType',
  /** column name */
  SaleId = 'saleId',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

export type Upgrade_Event_Log_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: Maybe<Upgrade_Event_Log_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: Maybe<Upgrade_Event_Log_Delete_At_Path_Input>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _delete_elem?: Maybe<Upgrade_Event_Log_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: Maybe<Upgrade_Event_Log_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Upgrade_Event_Log_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: Maybe<Upgrade_Event_Log_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Upgrade_Event_Log_Set_Input>;
  /** filter the rows which have to be updated */
  where: Upgrade_Event_Log_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Upgrade_Event_Log_Var_Pop_Fields = {
  __typename?: 'upgrade_event_log_var_pop_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Var_Pop_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Upgrade_Event_Log_Var_Samp_Fields = {
  __typename?: 'upgrade_event_log_var_samp_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Var_Samp_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Upgrade_Event_Log_Variance_Fields = {
  __typename?: 'upgrade_event_log_variance_fields';
  productAccessDays?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "upgrade_event_log" */
export type Upgrade_Event_Log_Variance_Order_By = {
  productAccessDays?: Maybe<Order_By>;
};

/** columns and relationships of "user_feedback" */
export type User_Feedback = {
  __typename?: 'user_feedback';
  createdAt: Scalars['timestamptz'];
  email?: Maybe<Scalars['String']>;
  feedback: Scalars['String'];
  id: Scalars['uuid'];
  ip: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  updatedAt: Scalars['timestamptz'];
  url: Scalars['String'];
  /** An object relationship */
  user?: Maybe<Users>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregated selection of "user_feedback" */
export type User_Feedback_Aggregate = {
  __typename?: 'user_feedback_aggregate';
  aggregate?: Maybe<User_Feedback_Aggregate_Fields>;
  nodes: Array<User_Feedback>;
};

export type User_Feedback_Aggregate_Bool_Exp = {
  count?: Maybe<User_Feedback_Aggregate_Bool_Exp_Count>;
};

export type User_Feedback_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<User_Feedback_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<User_Feedback_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_feedback" */
export type User_Feedback_Aggregate_Fields = {
  __typename?: 'user_feedback_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<User_Feedback_Max_Fields>;
  min?: Maybe<User_Feedback_Min_Fields>;
};


/** aggregate fields of "user_feedback" */
export type User_Feedback_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<User_Feedback_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "user_feedback" */
export type User_Feedback_Aggregate_Order_By = {
  count?: Maybe<Order_By>;
  max?: Maybe<User_Feedback_Max_Order_By>;
  min?: Maybe<User_Feedback_Min_Order_By>;
};

/** input type for inserting array relation for remote table "user_feedback" */
export type User_Feedback_Arr_Rel_Insert_Input = {
  data: Array<User_Feedback_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<User_Feedback_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user_feedback". All fields are combined with a logical 'AND'. */
export type User_Feedback_Bool_Exp = {
  _and?: Maybe<Array<User_Feedback_Bool_Exp>>;
  _not?: Maybe<User_Feedback_Bool_Exp>;
  _or?: Maybe<Array<User_Feedback_Bool_Exp>>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  email?: Maybe<String_Comparison_Exp>;
  feedback?: Maybe<String_Comparison_Exp>;
  id?: Maybe<Uuid_Comparison_Exp>;
  ip?: Maybe<String_Comparison_Exp>;
  name?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  url?: Maybe<String_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_feedback" */
export enum User_Feedback_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserFeedbackPkey = 'user_feedback_pkey'
}

/** input type for inserting data into table "user_feedback" */
export type User_Feedback_Insert_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  feedback?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  url?: Maybe<Scalars['String']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type User_Feedback_Max_Fields = {
  __typename?: 'user_feedback_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  feedback?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  url?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "user_feedback" */
export type User_Feedback_Max_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  feedback?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  name?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  url?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type User_Feedback_Min_Fields = {
  __typename?: 'user_feedback_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  feedback?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  url?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "user_feedback" */
export type User_Feedback_Min_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  feedback?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  name?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  url?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
};

/** response of any mutation on the table "user_feedback" */
export type User_Feedback_Mutation_Response = {
  __typename?: 'user_feedback_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Feedback>;
};

/** on_conflict condition type for table "user_feedback" */
export type User_Feedback_On_Conflict = {
  constraint: User_Feedback_Constraint;
  update_columns: Array<User_Feedback_Update_Column>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};

/** Ordering options when selecting data from "user_feedback". */
export type User_Feedback_Order_By = {
  createdAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  feedback?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  ip?: Maybe<Order_By>;
  name?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  url?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
};

/** primary key columns input for table: user_feedback */
export type User_Feedback_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "user_feedback" */
export enum User_Feedback_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Feedback = 'feedback',
  /** column name */
  Id = 'id',
  /** column name */
  Ip = 'ip',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Url = 'url',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "user_feedback" */
export type User_Feedback_Set_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  feedback?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  url?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};

/** Streaming cursor of the table "user_feedback" */
export type User_Feedback_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Feedback_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Feedback_Stream_Cursor_Value_Input = {
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  feedback?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  ip?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  url?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};

/** update columns of table "user_feedback" */
export enum User_Feedback_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Feedback = 'feedback',
  /** column name */
  Id = 'id',
  /** column name */
  Ip = 'ip',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Url = 'url',
  /** column name */
  UserId = 'userId'
}

export type User_Feedback_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<User_Feedback_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Feedback_Bool_Exp;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  /** An object relationship */
  activeLesson?: Maybe<Lessons>;
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  /** An array relationship */
  affiliateLinkClicks: Array<Affiliate_Link_Clicks>;
  /** An aggregate relationship */
  affiliateLinkClicks_aggregate: Affiliate_Link_Clicks_Aggregate;
  /** An array relationship */
  affiliatePayouts: Array<Affiliate_Payouts>;
  /** An aggregate relationship */
  affiliatePayouts_aggregate: Affiliate_Payouts_Aggregate;
  /** An array relationship */
  affiliateReferralClickCounts: Array<Affiliate_Referral_Click_Counts>;
  /** An aggregate relationship */
  affiliateReferralClickCounts_aggregate: Affiliate_Referral_Click_Counts_Aggregate;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  /** An array relationship */
  affiliateSales: Array<Affiliate_Sales>;
  /** An aggregate relationship */
  affiliateSales_aggregate: Affiliate_Sales_Aggregate;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus: Scalars['String'];
  /** An array relationship */
  alternateEmails: Array<Alternate_Emails>;
  /** An aggregate relationship */
  alternateEmails_aggregate: Alternate_Emails_Aggregate;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt: Scalars['timestamptz'];
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email: Scalars['String'];
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  facebookProfile?: Maybe<Scalars['jsonb']>;
  /** An array relationship */
  feedback: Array<User_Feedback>;
  /** An aggregate relationship */
  feedback_aggregate: User_Feedback_Aggregate;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleEmailVerified?: Maybe<Scalars['Boolean']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  /** An array relationship */
  lessonStatuses: Array<Users_Lessons_Status>;
  /** An aggregate relationship */
  lessonStatuses_aggregate: Users_Lessons_Status_Aggregate;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  /** An array relationship */
  payments: Array<Sales>;
  /** An aggregate relationship */
  payments_aggregate: Sales_Aggregate;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage: Scalars['String'];
  /** An array relationship */
  receivedGiftCards: Array<Gift_Cards>;
  /** An aggregate relationship */
  receivedGiftCards_aggregate: Gift_Cards_Aggregate;
  /** An array relationship */
  redeemedGiftCards: Array<Gift_Cards>;
  /** An aggregate relationship */
  redeemedGiftCards_aggregate: Gift_Cards_Aggregate;
  registrationSource: Scalars['String'];
  role: Scalars['String'];
  /** An array relationship */
  sentGiftCards: Array<Gift_Cards>;
  /** An aggregate relationship */
  sentGiftCards_aggregate: Gift_Cards_Aggregate;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  /** An array relationship */
  upgradeEventLogs: Array<Upgrade_Event_Log>;
  /** An aggregate relationship */
  upgradeEventLogs_aggregate: Upgrade_Event_Log_Aggregate;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};


/** columns and relationships of "users" */
export type UsersAffiliateLinkClicksArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliateLinkClicks_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Link_Clicks_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Link_Clicks_Order_By>>;
  where?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliatePayoutsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliatePayouts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Payouts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Payouts_Order_By>>;
  where?: Maybe<Affiliate_Payouts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliateReferralClickCountsArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliateReferralClickCounts_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Referral_Click_Counts_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Referral_Click_Counts_Order_By>>;
  where?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliateSalesArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAffiliateSales_AggregateArgs = {
  distinct_on?: Maybe<Array<Affiliate_Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Affiliate_Sales_Order_By>>;
  where?: Maybe<Affiliate_Sales_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAlternateEmailsArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAlternateEmails_AggregateArgs = {
  distinct_on?: Maybe<Array<Alternate_Emails_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Alternate_Emails_Order_By>>;
  where?: Maybe<Alternate_Emails_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersFacebookProfileArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "users" */
export type UsersFeedbackArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersFeedback_AggregateArgs = {
  distinct_on?: Maybe<Array<User_Feedback_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<User_Feedback_Order_By>>;
  where?: Maybe<User_Feedback_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersGithubProfileArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "users" */
export type UsersGoogleProfileArgs = {
  path?: Maybe<Scalars['String']>;
};


/** columns and relationships of "users" */
export type UsersLessonStatusesArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersLessonStatuses_AggregateArgs = {
  distinct_on?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Users_Lessons_Status_Order_By>>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersPaymentsArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersPayments_AggregateArgs = {
  distinct_on?: Maybe<Array<Sales_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Sales_Order_By>>;
  where?: Maybe<Sales_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReceivedGiftCardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReceivedGiftCards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersRedeemedGiftCardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersRedeemedGiftCards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersSentGiftCardsArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersSentGiftCards_AggregateArgs = {
  distinct_on?: Maybe<Array<Gift_Cards_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Gift_Cards_Order_By>>;
  where?: Maybe<Gift_Cards_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersUpgradeEventLogsArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersUpgradeEventLogs_AggregateArgs = {
  distinct_on?: Maybe<Array<Upgrade_Event_Log_Select_Column>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<Upgrade_Event_Log_Order_By>>;
  where?: Maybe<Upgrade_Event_Log_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Users_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Users_Append_Input = {
  facebookProfile?: Maybe<Scalars['jsonb']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  __typename?: 'users_avg_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: Maybe<Array<Users_Bool_Exp>>;
  _not?: Maybe<Users_Bool_Exp>;
  _or?: Maybe<Array<Users_Bool_Exp>>;
  activeLesson?: Maybe<Lessons_Bool_Exp>;
  activeLessonId?: Maybe<Uuid_Comparison_Exp>;
  affiliateEndedAt?: Maybe<Timestamptz_Comparison_Exp>;
  affiliateId?: Maybe<String_Comparison_Exp>;
  affiliateLinkClicks?: Maybe<Affiliate_Link_Clicks_Bool_Exp>;
  affiliateLinkClicks_aggregate?: Maybe<Affiliate_Link_Clicks_Aggregate_Bool_Exp>;
  affiliatePayouts?: Maybe<Affiliate_Payouts_Bool_Exp>;
  affiliatePayouts_aggregate?: Maybe<Affiliate_Payouts_Aggregate_Bool_Exp>;
  affiliateReferralClickCounts?: Maybe<Affiliate_Referral_Click_Counts_Bool_Exp>;
  affiliateReferralClickCounts_aggregate?: Maybe<Affiliate_Referral_Click_Counts_Aggregate_Bool_Exp>;
  affiliateRevenueShare?: Maybe<Numeric_Comparison_Exp>;
  affiliateSales?: Maybe<Affiliate_Sales_Bool_Exp>;
  affiliateSales_aggregate?: Maybe<Affiliate_Sales_Aggregate_Bool_Exp>;
  affiliateStartedAt?: Maybe<Timestamptz_Comparison_Exp>;
  affiliateStatus?: Maybe<String_Comparison_Exp>;
  alternateEmails?: Maybe<Alternate_Emails_Bool_Exp>;
  alternateEmails_aggregate?: Maybe<Alternate_Emails_Aggregate_Bool_Exp>;
  bio?: Maybe<String_Comparison_Exp>;
  company?: Maybe<String_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  deletedAt?: Maybe<Timestamptz_Comparison_Exp>;
  email?: Maybe<String_Comparison_Exp>;
  facebookAccessToken?: Maybe<String_Comparison_Exp>;
  facebookId?: Maybe<String_Comparison_Exp>;
  facebookProfile?: Maybe<Jsonb_Comparison_Exp>;
  feedback?: Maybe<User_Feedback_Bool_Exp>;
  feedback_aggregate?: Maybe<User_Feedback_Aggregate_Bool_Exp>;
  firstName?: Maybe<String_Comparison_Exp>;
  fullCourseAccessEndsAt?: Maybe<Timestamptz_Comparison_Exp>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Timestamptz_Comparison_Exp>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Timestamptz_Comparison_Exp>;
  fullCourseAccessTerminatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  gitconnectedUsername?: Maybe<String_Comparison_Exp>;
  githubAccessToken?: Maybe<String_Comparison_Exp>;
  githubId?: Maybe<Int_Comparison_Exp>;
  githubNodeId?: Maybe<String_Comparison_Exp>;
  githubProfile?: Maybe<Jsonb_Comparison_Exp>;
  githubUsername?: Maybe<String_Comparison_Exp>;
  googleAccessToken?: Maybe<String_Comparison_Exp>;
  googleEmailVerified?: Maybe<Boolean_Comparison_Exp>;
  googleId?: Maybe<String_Comparison_Exp>;
  googleIdToken?: Maybe<String_Comparison_Exp>;
  googleProfile?: Maybe<Jsonb_Comparison_Exp>;
  googleRefreshToken?: Maybe<String_Comparison_Exp>;
  googleTokenExpiryDate?: Maybe<String_Comparison_Exp>;
  googleTokenType?: Maybe<String_Comparison_Exp>;
  id?: Maybe<String_Comparison_Exp>;
  image?: Maybe<String_Comparison_Exp>;
  lastName?: Maybe<String_Comparison_Exp>;
  lessonStatuses?: Maybe<Users_Lessons_Status_Bool_Exp>;
  lessonStatuses_aggregate?: Maybe<Users_Lessons_Status_Aggregate_Bool_Exp>;
  locale?: Maybe<String_Comparison_Exp>;
  location?: Maybe<String_Comparison_Exp>;
  middleName?: Maybe<String_Comparison_Exp>;
  name?: Maybe<String_Comparison_Exp>;
  nameFormat?: Maybe<String_Comparison_Exp>;
  payments?: Maybe<Sales_Bool_Exp>;
  payments_aggregate?: Maybe<Sales_Aggregate_Bool_Exp>;
  paypalEmail?: Maybe<String_Comparison_Exp>;
  preferredCodingLanguage?: Maybe<String_Comparison_Exp>;
  receivedGiftCards?: Maybe<Gift_Cards_Bool_Exp>;
  receivedGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Bool_Exp>;
  redeemedGiftCards?: Maybe<Gift_Cards_Bool_Exp>;
  redeemedGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Bool_Exp>;
  registrationSource?: Maybe<String_Comparison_Exp>;
  role?: Maybe<String_Comparison_Exp>;
  sentGiftCards?: Maybe<Gift_Cards_Bool_Exp>;
  sentGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Bool_Exp>;
  shortName?: Maybe<String_Comparison_Exp>;
  stripeCustomerId?: Maybe<String_Comparison_Exp>;
  theme?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  upgradeEventLogs?: Maybe<Upgrade_Event_Log_Bool_Exp>;
  upgradeEventLogs_aggregate?: Maybe<Upgrade_Event_Log_Aggregate_Bool_Exp>;
  username?: Maybe<String_Comparison_Exp>;
  website?: Maybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "affiliateId" */
  UsersAffiliateIdKey = 'users_affiliateId_key',
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "facebookId" */
  UsersFacebookIdKey = 'users_facebookId_key',
  /** unique or primary key constraint on columns "githubNodeId" */
  UsersGithubNodeIdKey = 'users_githubNodeId_key',
  /** unique or primary key constraint on columns "id" */
  UsersIdKey = 'users_id_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey',
  /** unique or primary key constraint on columns "stripeCustomerId" */
  UsersStripeCustomerIdKey = 'users_stripeCustomerId_key',
  /** unique or primary key constraint on columns "username" */
  UsersUsernameKey = 'users_username_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Users_Delete_At_Path_Input = {
  facebookProfile?: Maybe<Array<Scalars['String']>>;
  githubProfile?: Maybe<Array<Scalars['String']>>;
  googleProfile?: Maybe<Array<Scalars['String']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type Users_Delete_Elem_Input = {
  facebookProfile?: Maybe<Scalars['Int']>;
  githubProfile?: Maybe<Scalars['Int']>;
  googleProfile?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Users_Delete_Key_Input = {
  facebookProfile?: Maybe<Scalars['String']>;
  githubProfile?: Maybe<Scalars['String']>;
  googleProfile?: Maybe<Scalars['String']>;
};

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  githubId?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  activeLesson?: Maybe<Lessons_Obj_Rel_Insert_Input>;
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateLinkClicks?: Maybe<Affiliate_Link_Clicks_Arr_Rel_Insert_Input>;
  affiliatePayouts?: Maybe<Affiliate_Payouts_Arr_Rel_Insert_Input>;
  affiliateReferralClickCounts?: Maybe<Affiliate_Referral_Click_Counts_Arr_Rel_Insert_Input>;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  affiliateSales?: Maybe<Affiliate_Sales_Arr_Rel_Insert_Input>;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus?: Maybe<Scalars['String']>;
  alternateEmails?: Maybe<Alternate_Emails_Arr_Rel_Insert_Input>;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  facebookProfile?: Maybe<Scalars['jsonb']>;
  feedback?: Maybe<User_Feedback_Arr_Rel_Insert_Input>;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleEmailVerified?: Maybe<Scalars['Boolean']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  lessonStatuses?: Maybe<Users_Lessons_Status_Arr_Rel_Insert_Input>;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  payments?: Maybe<Sales_Arr_Rel_Insert_Input>;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage?: Maybe<Scalars['String']>;
  receivedGiftCards?: Maybe<Gift_Cards_Arr_Rel_Insert_Input>;
  redeemedGiftCards?: Maybe<Gift_Cards_Arr_Rel_Insert_Input>;
  registrationSource?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  sentGiftCards?: Maybe<Gift_Cards_Arr_Rel_Insert_Input>;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  upgradeEventLogs?: Maybe<Upgrade_Event_Log_Arr_Rel_Insert_Input>;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

/** columns and relationships of "users_lessons_status" */
export type Users_Lessons_Status = {
  __typename?: 'users_lessons_status';
  confidence?: Maybe<Scalars['Int']>;
  createdAt: Scalars['timestamptz'];
  explanationStepsViewed: Scalars['Int'];
  /** An object relationship */
  lesson: Lessons;
  lessonId: Scalars['uuid'];
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  userId: Scalars['String'];
  validationStepsViewed: Scalars['Int'];
};

/** aggregated selection of "users_lessons_status" */
export type Users_Lessons_Status_Aggregate = {
  __typename?: 'users_lessons_status_aggregate';
  aggregate?: Maybe<Users_Lessons_Status_Aggregate_Fields>;
  nodes: Array<Users_Lessons_Status>;
};

export type Users_Lessons_Status_Aggregate_Bool_Exp = {
  count?: Maybe<Users_Lessons_Status_Aggregate_Bool_Exp_Count>;
};

export type Users_Lessons_Status_Aggregate_Bool_Exp_Count = {
  arguments?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
  filter?: Maybe<Users_Lessons_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "users_lessons_status" */
export type Users_Lessons_Status_Aggregate_Fields = {
  __typename?: 'users_lessons_status_aggregate_fields';
  avg?: Maybe<Users_Lessons_Status_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Users_Lessons_Status_Max_Fields>;
  min?: Maybe<Users_Lessons_Status_Min_Fields>;
  stddev?: Maybe<Users_Lessons_Status_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Lessons_Status_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Lessons_Status_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Lessons_Status_Sum_Fields>;
  var_pop?: Maybe<Users_Lessons_Status_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Lessons_Status_Var_Samp_Fields>;
  variance?: Maybe<Users_Lessons_Status_Variance_Fields>;
};


/** aggregate fields of "users_lessons_status" */
export type Users_Lessons_Status_Aggregate_FieldsCountArgs = {
  columns?: Maybe<Array<Users_Lessons_Status_Select_Column>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "users_lessons_status" */
export type Users_Lessons_Status_Aggregate_Order_By = {
  avg?: Maybe<Users_Lessons_Status_Avg_Order_By>;
  count?: Maybe<Order_By>;
  max?: Maybe<Users_Lessons_Status_Max_Order_By>;
  min?: Maybe<Users_Lessons_Status_Min_Order_By>;
  stddev?: Maybe<Users_Lessons_Status_Stddev_Order_By>;
  stddev_pop?: Maybe<Users_Lessons_Status_Stddev_Pop_Order_By>;
  stddev_samp?: Maybe<Users_Lessons_Status_Stddev_Samp_Order_By>;
  sum?: Maybe<Users_Lessons_Status_Sum_Order_By>;
  var_pop?: Maybe<Users_Lessons_Status_Var_Pop_Order_By>;
  var_samp?: Maybe<Users_Lessons_Status_Var_Samp_Order_By>;
  variance?: Maybe<Users_Lessons_Status_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "users_lessons_status" */
export type Users_Lessons_Status_Arr_Rel_Insert_Input = {
  data: Array<Users_Lessons_Status_Insert_Input>;
  /** upsert condition */
  on_conflict?: Maybe<Users_Lessons_Status_On_Conflict>;
};

/** aggregate avg on columns */
export type Users_Lessons_Status_Avg_Fields = {
  __typename?: 'users_lessons_status_avg_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Avg_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** Boolean expression to filter rows from the table "users_lessons_status". All fields are combined with a logical 'AND'. */
export type Users_Lessons_Status_Bool_Exp = {
  _and?: Maybe<Array<Users_Lessons_Status_Bool_Exp>>;
  _not?: Maybe<Users_Lessons_Status_Bool_Exp>;
  _or?: Maybe<Array<Users_Lessons_Status_Bool_Exp>>;
  confidence?: Maybe<Int_Comparison_Exp>;
  createdAt?: Maybe<Timestamptz_Comparison_Exp>;
  explanationStepsViewed?: Maybe<Int_Comparison_Exp>;
  lesson?: Maybe<Lessons_Bool_Exp>;
  lessonId?: Maybe<Uuid_Comparison_Exp>;
  notes?: Maybe<String_Comparison_Exp>;
  savedCode?: Maybe<String_Comparison_Exp>;
  status?: Maybe<String_Comparison_Exp>;
  updatedAt?: Maybe<Timestamptz_Comparison_Exp>;
  user?: Maybe<Users_Bool_Exp>;
  userId?: Maybe<String_Comparison_Exp>;
  validationStepsViewed?: Maybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "users_lessons_status" */
export enum Users_Lessons_Status_Constraint {
  /** unique or primary key constraint on columns "userId", "lessonId" */
  UsersLessonsStatusPkey = 'users_lessons_status_pkey'
}

/** input type for incrementing numeric columns in table "users_lessons_status" */
export type Users_Lessons_Status_Inc_Input = {
  confidence?: Maybe<Scalars['Int']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "users_lessons_status" */
export type Users_Lessons_Status_Insert_Input = {
  confidence?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  lesson?: Maybe<Lessons_Obj_Rel_Insert_Input>;
  lessonId?: Maybe<Scalars['uuid']>;
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  user?: Maybe<Users_Obj_Rel_Insert_Input>;
  userId?: Maybe<Scalars['String']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Users_Lessons_Status_Max_Fields = {
  __typename?: 'users_lessons_status_max_fields';
  confidence?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  lessonId?: Maybe<Scalars['uuid']>;
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Max_Order_By = {
  confidence?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  lessonId?: Maybe<Order_By>;
  notes?: Maybe<Order_By>;
  savedCode?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate min on columns */
export type Users_Lessons_Status_Min_Fields = {
  __typename?: 'users_lessons_status_min_fields';
  confidence?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  lessonId?: Maybe<Scalars['uuid']>;
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Min_Order_By = {
  confidence?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  lessonId?: Maybe<Order_By>;
  notes?: Maybe<Order_By>;
  savedCode?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  userId?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** response of any mutation on the table "users_lessons_status" */
export type Users_Lessons_Status_Mutation_Response = {
  __typename?: 'users_lessons_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Users_Lessons_Status>;
};

/** on_conflict condition type for table "users_lessons_status" */
export type Users_Lessons_Status_On_Conflict = {
  constraint: Users_Lessons_Status_Constraint;
  update_columns: Array<Users_Lessons_Status_Update_Column>;
  where?: Maybe<Users_Lessons_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "users_lessons_status". */
export type Users_Lessons_Status_Order_By = {
  confidence?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  lesson?: Maybe<Lessons_Order_By>;
  lessonId?: Maybe<Order_By>;
  notes?: Maybe<Order_By>;
  savedCode?: Maybe<Order_By>;
  status?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  user?: Maybe<Users_Order_By>;
  userId?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** primary key columns input for table: users_lessons_status */
export type Users_Lessons_Status_Pk_Columns_Input = {
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
};

/** select columns of table "users_lessons_status" */
export enum Users_Lessons_Status_Select_Column {
  /** column name */
  Confidence = 'confidence',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  ExplanationStepsViewed = 'explanationStepsViewed',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  Notes = 'notes',
  /** column name */
  SavedCode = 'savedCode',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId',
  /** column name */
  ValidationStepsViewed = 'validationStepsViewed'
}

/** input type for updating data in table "users_lessons_status" */
export type Users_Lessons_Status_Set_Input = {
  confidence?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  lessonId?: Maybe<Scalars['uuid']>;
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Users_Lessons_Status_Stddev_Fields = {
  __typename?: 'users_lessons_status_stddev_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Stddev_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Users_Lessons_Status_Stddev_Pop_Fields = {
  __typename?: 'users_lessons_status_stddev_pop_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Stddev_Pop_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Users_Lessons_Status_Stddev_Samp_Fields = {
  __typename?: 'users_lessons_status_stddev_samp_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Stddev_Samp_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** Streaming cursor of the table "users_lessons_status" */
export type Users_Lessons_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Lessons_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Lessons_Status_Stream_Cursor_Value_Input = {
  confidence?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  lessonId?: Maybe<Scalars['uuid']>;
  notes?: Maybe<Scalars['String']>;
  savedCode?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['String']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** aggregate sum on columns */
export type Users_Lessons_Status_Sum_Fields = {
  __typename?: 'users_lessons_status_sum_fields';
  confidence?: Maybe<Scalars['Int']>;
  explanationStepsViewed?: Maybe<Scalars['Int']>;
  validationStepsViewed?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Sum_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** update columns of table "users_lessons_status" */
export enum Users_Lessons_Status_Update_Column {
  /** column name */
  Confidence = 'confidence',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  ExplanationStepsViewed = 'explanationStepsViewed',
  /** column name */
  LessonId = 'lessonId',
  /** column name */
  Notes = 'notes',
  /** column name */
  SavedCode = 'savedCode',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId',
  /** column name */
  ValidationStepsViewed = 'validationStepsViewed'
}

export type Users_Lessons_Status_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Users_Lessons_Status_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Users_Lessons_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Lessons_Status_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Users_Lessons_Status_Var_Pop_Fields = {
  __typename?: 'users_lessons_status_var_pop_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Var_Pop_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Users_Lessons_Status_Var_Samp_Fields = {
  __typename?: 'users_lessons_status_var_samp_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Var_Samp_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate variance on columns */
export type Users_Lessons_Status_Variance_Fields = {
  __typename?: 'users_lessons_status_variance_fields';
  confidence?: Maybe<Scalars['Float']>;
  explanationStepsViewed?: Maybe<Scalars['Float']>;
  validationStepsViewed?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "users_lessons_status" */
export type Users_Lessons_Status_Variance_Order_By = {
  confidence?: Maybe<Order_By>;
  explanationStepsViewed?: Maybe<Order_By>;
  validationStepsViewed?: Maybe<Order_By>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage?: Maybe<Scalars['String']>;
  registrationSource?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage?: Maybe<Scalars['String']>;
  registrationSource?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: Maybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns: Array<Users_Update_Column>;
  where?: Maybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  activeLesson?: Maybe<Lessons_Order_By>;
  activeLessonId?: Maybe<Order_By>;
  affiliateEndedAt?: Maybe<Order_By>;
  affiliateId?: Maybe<Order_By>;
  affiliateLinkClicks_aggregate?: Maybe<Affiliate_Link_Clicks_Aggregate_Order_By>;
  affiliatePayouts_aggregate?: Maybe<Affiliate_Payouts_Aggregate_Order_By>;
  affiliateReferralClickCounts_aggregate?: Maybe<Affiliate_Referral_Click_Counts_Aggregate_Order_By>;
  affiliateRevenueShare?: Maybe<Order_By>;
  affiliateSales_aggregate?: Maybe<Affiliate_Sales_Aggregate_Order_By>;
  affiliateStartedAt?: Maybe<Order_By>;
  affiliateStatus?: Maybe<Order_By>;
  alternateEmails_aggregate?: Maybe<Alternate_Emails_Aggregate_Order_By>;
  bio?: Maybe<Order_By>;
  company?: Maybe<Order_By>;
  createdAt?: Maybe<Order_By>;
  deletedAt?: Maybe<Order_By>;
  email?: Maybe<Order_By>;
  facebookAccessToken?: Maybe<Order_By>;
  facebookId?: Maybe<Order_By>;
  facebookProfile?: Maybe<Order_By>;
  feedback_aggregate?: Maybe<User_Feedback_Aggregate_Order_By>;
  firstName?: Maybe<Order_By>;
  fullCourseAccessEndsAt?: Maybe<Order_By>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Order_By>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Order_By>;
  fullCourseAccessTerminatedAt?: Maybe<Order_By>;
  gitconnectedUsername?: Maybe<Order_By>;
  githubAccessToken?: Maybe<Order_By>;
  githubId?: Maybe<Order_By>;
  githubNodeId?: Maybe<Order_By>;
  githubProfile?: Maybe<Order_By>;
  githubUsername?: Maybe<Order_By>;
  googleAccessToken?: Maybe<Order_By>;
  googleEmailVerified?: Maybe<Order_By>;
  googleId?: Maybe<Order_By>;
  googleIdToken?: Maybe<Order_By>;
  googleProfile?: Maybe<Order_By>;
  googleRefreshToken?: Maybe<Order_By>;
  googleTokenExpiryDate?: Maybe<Order_By>;
  googleTokenType?: Maybe<Order_By>;
  id?: Maybe<Order_By>;
  image?: Maybe<Order_By>;
  lastName?: Maybe<Order_By>;
  lessonStatuses_aggregate?: Maybe<Users_Lessons_Status_Aggregate_Order_By>;
  locale?: Maybe<Order_By>;
  location?: Maybe<Order_By>;
  middleName?: Maybe<Order_By>;
  name?: Maybe<Order_By>;
  nameFormat?: Maybe<Order_By>;
  payments_aggregate?: Maybe<Sales_Aggregate_Order_By>;
  paypalEmail?: Maybe<Order_By>;
  preferredCodingLanguage?: Maybe<Order_By>;
  receivedGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Order_By>;
  redeemedGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Order_By>;
  registrationSource?: Maybe<Order_By>;
  role?: Maybe<Order_By>;
  sentGiftCards_aggregate?: Maybe<Gift_Cards_Aggregate_Order_By>;
  shortName?: Maybe<Order_By>;
  stripeCustomerId?: Maybe<Order_By>;
  theme?: Maybe<Order_By>;
  updatedAt?: Maybe<Order_By>;
  upgradeEventLogs_aggregate?: Maybe<Upgrade_Event_Log_Aggregate_Order_By>;
  username?: Maybe<Order_By>;
  website?: Maybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['String'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Users_Prepend_Input = {
  facebookProfile?: Maybe<Scalars['jsonb']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  ActiveLessonId = 'activeLessonId',
  /** column name */
  AffiliateEndedAt = 'affiliateEndedAt',
  /** column name */
  AffiliateId = 'affiliateId',
  /** column name */
  AffiliateRevenueShare = 'affiliateRevenueShare',
  /** column name */
  AffiliateStartedAt = 'affiliateStartedAt',
  /** column name */
  AffiliateStatus = 'affiliateStatus',
  /** column name */
  Bio = 'bio',
  /** column name */
  Company = 'company',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DeletedAt = 'deletedAt',
  /** column name */
  Email = 'email',
  /** column name */
  FacebookAccessToken = 'facebookAccessToken',
  /** column name */
  FacebookId = 'facebookId',
  /** column name */
  FacebookProfile = 'facebookProfile',
  /** column name */
  FirstName = 'firstName',
  /** column name */
  FullCourseAccessEndsAt = 'fullCourseAccessEndsAt',
  /** column name */
  FullCourseAccessFirstUpgradedAt = 'fullCourseAccessFirstUpgradedAt',
  /** column name */
  FullCourseAccessLatestUpgradedAt = 'fullCourseAccessLatestUpgradedAt',
  /** column name */
  FullCourseAccessTerminatedAt = 'fullCourseAccessTerminatedAt',
  /** column name */
  GitconnectedUsername = 'gitconnectedUsername',
  /** column name */
  GithubAccessToken = 'githubAccessToken',
  /** column name */
  GithubId = 'githubId',
  /** column name */
  GithubNodeId = 'githubNodeId',
  /** column name */
  GithubProfile = 'githubProfile',
  /** column name */
  GithubUsername = 'githubUsername',
  /** column name */
  GoogleAccessToken = 'googleAccessToken',
  /** column name */
  GoogleEmailVerified = 'googleEmailVerified',
  /** column name */
  GoogleId = 'googleId',
  /** column name */
  GoogleIdToken = 'googleIdToken',
  /** column name */
  GoogleProfile = 'googleProfile',
  /** column name */
  GoogleRefreshToken = 'googleRefreshToken',
  /** column name */
  GoogleTokenExpiryDate = 'googleTokenExpiryDate',
  /** column name */
  GoogleTokenType = 'googleTokenType',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  LastName = 'lastName',
  /** column name */
  Locale = 'locale',
  /** column name */
  Location = 'location',
  /** column name */
  MiddleName = 'middleName',
  /** column name */
  Name = 'name',
  /** column name */
  NameFormat = 'nameFormat',
  /** column name */
  PaypalEmail = 'paypalEmail',
  /** column name */
  PreferredCodingLanguage = 'preferredCodingLanguage',
  /** column name */
  RegistrationSource = 'registrationSource',
  /** column name */
  Role = 'role',
  /** column name */
  ShortName = 'shortName',
  /** column name */
  StripeCustomerId = 'stripeCustomerId',
  /** column name */
  Theme = 'theme',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Username = 'username',
  /** column name */
  Website = 'website'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  facebookProfile?: Maybe<Scalars['jsonb']>;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleEmailVerified?: Maybe<Scalars['Boolean']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage?: Maybe<Scalars['String']>;
  registrationSource?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: Maybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  activeLessonId?: Maybe<Scalars['uuid']>;
  affiliateEndedAt?: Maybe<Scalars['timestamptz']>;
  affiliateId?: Maybe<Scalars['String']>;
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  affiliateStartedAt?: Maybe<Scalars['timestamptz']>;
  affiliateStatus?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  deletedAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  facebookAccessToken?: Maybe<Scalars['String']>;
  facebookId?: Maybe<Scalars['String']>;
  facebookProfile?: Maybe<Scalars['jsonb']>;
  firstName?: Maybe<Scalars['String']>;
  fullCourseAccessEndsAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessFirstUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessLatestUpgradedAt?: Maybe<Scalars['timestamptz']>;
  fullCourseAccessTerminatedAt?: Maybe<Scalars['timestamptz']>;
  gitconnectedUsername?: Maybe<Scalars['String']>;
  githubAccessToken?: Maybe<Scalars['String']>;
  githubId?: Maybe<Scalars['Int']>;
  githubNodeId?: Maybe<Scalars['String']>;
  githubProfile?: Maybe<Scalars['jsonb']>;
  githubUsername?: Maybe<Scalars['String']>;
  googleAccessToken?: Maybe<Scalars['String']>;
  googleEmailVerified?: Maybe<Scalars['Boolean']>;
  googleId?: Maybe<Scalars['String']>;
  googleIdToken?: Maybe<Scalars['String']>;
  googleProfile?: Maybe<Scalars['jsonb']>;
  googleRefreshToken?: Maybe<Scalars['String']>;
  googleTokenExpiryDate?: Maybe<Scalars['String']>;
  googleTokenType?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  nameFormat?: Maybe<Scalars['String']>;
  paypalEmail?: Maybe<Scalars['String']>;
  preferredCodingLanguage?: Maybe<Scalars['String']>;
  registrationSource?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  shortName?: Maybe<Scalars['String']>;
  stripeCustomerId?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  username?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  affiliateRevenueShare?: Maybe<Scalars['numeric']>;
  githubId?: Maybe<Scalars['Int']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  ActiveLessonId = 'activeLessonId',
  /** column name */
  AffiliateEndedAt = 'affiliateEndedAt',
  /** column name */
  AffiliateId = 'affiliateId',
  /** column name */
  AffiliateRevenueShare = 'affiliateRevenueShare',
  /** column name */
  AffiliateStartedAt = 'affiliateStartedAt',
  /** column name */
  AffiliateStatus = 'affiliateStatus',
  /** column name */
  Bio = 'bio',
  /** column name */
  Company = 'company',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DeletedAt = 'deletedAt',
  /** column name */
  Email = 'email',
  /** column name */
  FacebookAccessToken = 'facebookAccessToken',
  /** column name */
  FacebookId = 'facebookId',
  /** column name */
  FacebookProfile = 'facebookProfile',
  /** column name */
  FirstName = 'firstName',
  /** column name */
  FullCourseAccessEndsAt = 'fullCourseAccessEndsAt',
  /** column name */
  FullCourseAccessFirstUpgradedAt = 'fullCourseAccessFirstUpgradedAt',
  /** column name */
  FullCourseAccessLatestUpgradedAt = 'fullCourseAccessLatestUpgradedAt',
  /** column name */
  FullCourseAccessTerminatedAt = 'fullCourseAccessTerminatedAt',
  /** column name */
  GitconnectedUsername = 'gitconnectedUsername',
  /** column name */
  GithubAccessToken = 'githubAccessToken',
  /** column name */
  GithubId = 'githubId',
  /** column name */
  GithubNodeId = 'githubNodeId',
  /** column name */
  GithubProfile = 'githubProfile',
  /** column name */
  GithubUsername = 'githubUsername',
  /** column name */
  GoogleAccessToken = 'googleAccessToken',
  /** column name */
  GoogleEmailVerified = 'googleEmailVerified',
  /** column name */
  GoogleId = 'googleId',
  /** column name */
  GoogleIdToken = 'googleIdToken',
  /** column name */
  GoogleProfile = 'googleProfile',
  /** column name */
  GoogleRefreshToken = 'googleRefreshToken',
  /** column name */
  GoogleTokenExpiryDate = 'googleTokenExpiryDate',
  /** column name */
  GoogleTokenType = 'googleTokenType',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  LastName = 'lastName',
  /** column name */
  Locale = 'locale',
  /** column name */
  Location = 'location',
  /** column name */
  MiddleName = 'middleName',
  /** column name */
  Name = 'name',
  /** column name */
  NameFormat = 'nameFormat',
  /** column name */
  PaypalEmail = 'paypalEmail',
  /** column name */
  PreferredCodingLanguage = 'preferredCodingLanguage',
  /** column name */
  RegistrationSource = 'registrationSource',
  /** column name */
  Role = 'role',
  /** column name */
  ShortName = 'shortName',
  /** column name */
  StripeCustomerId = 'stripeCustomerId',
  /** column name */
  Theme = 'theme',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  Username = 'username',
  /** column name */
  Website = 'website'
}

export type Users_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: Maybe<Users_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: Maybe<Users_Delete_At_Path_Input>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _delete_elem?: Maybe<Users_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: Maybe<Users_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: Maybe<Users_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: Maybe<Users_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: Maybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  __typename?: 'users_var_pop_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  affiliateRevenueShare?: Maybe<Scalars['Float']>;
  githubId?: Maybe<Scalars['Float']>;
};


/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: Maybe<Scalars['uuid']>;
  _gt?: Maybe<Scalars['uuid']>;
  _gte?: Maybe<Scalars['uuid']>;
  _in?: Maybe<Array<Scalars['uuid']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['uuid']>;
  _lte?: Maybe<Scalars['uuid']>;
  _neq?: Maybe<Scalars['uuid']>;
  _nin?: Maybe<Array<Scalars['uuid']>>;
};

export type CategoryLessonsFragment = (
  { __typename?: 'categories' }
  & Pick<Categories, 'id' | 'position' | 'previewVideo' | 'title' | 'description' | 'slug'>
  & { lessons: Array<(
    { __typename?: 'lessons' }
    & Pick<Lessons, 'accessLevel' | 'description' | 'position' | 'slug' | 'title' | 'type' | 'id'>
  )> }
);

export type GetCategoryLessonsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoryLessonsQuery = (
  { __typename?: 'query_root' }
  & { categories: Array<(
    { __typename?: 'categories' }
    & CategoryLessonsFragment
  )> }
);

export type GetCategoryLessonsWithViewerQueryVariables = Exact<{
  userId: Scalars['String'];
}>;


export type GetCategoryLessonsWithViewerQuery = (
  { __typename?: 'query_root' }
  & { categories: Array<(
    { __typename?: 'categories' }
    & CategoryLessonsFragment
  )>, users_lessons_status: Array<(
    { __typename?: 'users_lessons_status' }
    & Pick<Users_Lessons_Status, 'explanationStepsViewed' | 'validationStepsViewed' | 'status' | 'lessonId' | 'userId' | 'notes'>
  )>, users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & UserAsViewerFragment
  )> }
);

export type UpdatePreferredCodingLanguageMutationVariables = Exact<{
  id: Scalars['String'];
  preferredCodingLanguage: Scalars['String'];
}>;


export type UpdatePreferredCodingLanguageMutation = (
  { __typename?: 'mutation_root' }
  & { update_users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & Pick<Users, 'id'>
  )> }
);

export type UserAsViewerFragment = (
  { __typename?: 'users' }
  & Pick<Users, 'id' | 'preferredCodingLanguage' | 'registrationSource' | 'role' | 'theme' | 'name' | 'email' | 'fullCourseAccessEndsAt' | 'fullCourseAccessLatestUpgradedAt' | 'fullCourseAccessFirstUpgradedAt' | 'affiliateId' | 'affiliateStatus'>
  & { activeLesson?: Maybe<(
    { __typename?: 'lessons' }
    & Pick<Lessons, 'id' | 'slug' | 'title' | 'description'>
  )> }
);

export type InsertLessonStatusMutationVariables = Exact<{
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
  explanationStepsViewed?: Scalars['Int'];
  validationStepsViewed?: Scalars['Int'];
  status: Scalars['String'];
}>;


export type InsertLessonStatusMutation = (
  { __typename?: 'mutation_root' }
  & { insert_users_lessons_status?: Maybe<(
    { __typename?: 'users_lessons_status_mutation_response' }
    & { returning: Array<(
      { __typename?: 'users_lessons_status' }
      & Pick<Users_Lessons_Status, 'validationStepsViewed' | 'status' | 'lessonId' | 'userId' | 'explanationStepsViewed'>
    )> }
  )> }
);

export type SetActiveLessonMutationVariables = Exact<{
  userId: Scalars['String'];
  lessonId: Scalars['uuid'];
}>;


export type SetActiveLessonMutation = (
  { __typename?: 'mutation_root' }
  & { update_users?: Maybe<(
    { __typename?: 'users_mutation_response' }
    & { returning: Array<(
      { __typename?: 'users' }
      & Pick<Users, 'id'>
      & { activeLesson?: Maybe<(
        { __typename?: 'lessons' }
        & Pick<Lessons, 'id' | 'slug'>
      )> }
    )> }
  )> }
);

export type SetFinishLessonStatusMutationVariables = Exact<{
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
  status: Scalars['String'];
  confidence: Scalars['Int'];
}>;


export type SetFinishLessonStatusMutation = (
  { __typename?: 'mutation_root' }
  & { update_users_lessons_status?: Maybe<(
    { __typename?: 'users_lessons_status_mutation_response' }
    & { returning: Array<(
      { __typename?: 'users_lessons_status' }
      & Pick<Users_Lessons_Status, 'validationStepsViewed' | 'status' | 'explanationStepsViewed' | 'lessonId' | 'userId'>
    )> }
  )> }
);

export type UpdateUserLessonNotesMutationVariables = Exact<{
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
}>;


export type UpdateUserLessonNotesMutation = (
  { __typename?: 'mutation_root' }
  & { update_users_lessons_status_by_pk?: Maybe<(
    { __typename?: 'users_lessons_status' }
    & Pick<Users_Lessons_Status, 'status' | 'explanationStepsViewed' | 'validationStepsViewed' | 'confidence' | 'lessonId' | 'userId' | 'notes'>
  )> }
);

export type UpdateUserSavedCodeMutationVariables = Exact<{
  lessonId: Scalars['uuid'];
  userId: Scalars['String'];
  code?: Maybe<Scalars['String']>;
  language: Scalars['String'];
}>;


export type UpdateUserSavedCodeMutation = (
  { __typename?: 'mutation_root' }
  & { insert_code_drafts?: Maybe<(
    { __typename?: 'code_drafts_mutation_response' }
    & { returning: Array<(
      { __typename?: 'code_drafts' }
      & Pick<Code_Drafts, 'code' | 'createdAt' | 'id' | 'language' | 'lessonId' | 'updatedAt' | 'userId'>
    )> }
  )> }
);

export type GetCodeSubmissionByTokenQueryVariables = Exact<{
  codeRunnerToken: Scalars['String'];
}>;


export type GetCodeSubmissionByTokenQuery = (
  { __typename?: 'query_root' }
  & { code_submissions: Array<(
    { __typename?: 'code_submissions' }
    & Pick<Code_Submissions, 'code' | 'codeRunnerStatusDescription' | 'codeRunnerStatusId' | 'codeRunnerToken' | 'compileOutput' | 'compileOutputDecoded' | 'createdAt' | 'diagnostics' | 'environment' | 'executionStatus' | 'id' | 'language' | 'memory' | 'message' | 'messageDecoded' | 'resultStatus' | 'results' | 'runnerVersion' | 'logs' | 'stderr' | 'stderrDecoded' | 'stdout' | 'stdoutDecoded' | 'tests' | 'time' | 'validator'>
  )> }
);

export type GetLessonBySlugWithViewerQueryVariables = Exact<{
  slug: Scalars['String'];
  userId: Scalars['String'];
}>;


export type GetLessonBySlugWithViewerQuery = (
  { __typename?: 'query_root' }
  & { lessons: Array<(
    { __typename?: 'lessons' }
    & Pick<Lessons, 'title' | 'slug' | 'position' | 'id' | 'description' | 'accessLevel' | 'introductionVideoUrl' | 'type' | 'metaTitle' | 'metaDescription' | 'status'>
    & { category: (
      { __typename?: 'categories' }
      & Pick<Categories, 'title' | 'slug' | 'id'>
    ) }
  )>, users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & UserAsViewerFragment
  )>, users_lessons_status: Array<(
    { __typename?: 'users_lessons_status' }
    & Pick<Users_Lessons_Status, 'status' | 'explanationStepsViewed' | 'validationStepsViewed' | 'confidence' | 'lessonId' | 'userId' | 'notes'>
  )>, code_drafts: Array<(
    { __typename?: 'code_drafts' }
    & Pick<Code_Drafts, 'code' | 'createdAt' | 'id' | 'language' | 'lessonId' | 'updatedAt' | 'userId'>
  )> }
);

export type GetLessonsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLessonsQuery = (
  { __typename?: 'query_root' }
  & { lessons: Array<(
    { __typename?: 'lessons' }
    & Pick<Lessons, 'id' | 'title' | 'slug' | 'position' | 'description' | 'accessLevel' | 'introductionVideoUrl'>
  )> }
);

export type GetLessonBySlugQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetLessonBySlugQuery = (
  { __typename?: 'query_root' }
  & { lessons: Array<(
    { __typename?: 'lessons' }
    & Pick<Lessons, 'title' | 'slug' | 'position' | 'id' | 'description' | 'accessLevel' | 'introductionVideoUrl' | 'type' | 'metaTitle' | 'metaDescription' | 'status'>
    & { category: (
      { __typename?: 'categories' }
      & Pick<Categories, 'id' | 'title' | 'slug'>
    ) }
  )> }
);

export type GetViewerQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetViewerQuery = (
  { __typename?: 'query_root' }
  & { users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & UserAsViewerFragment
  )> }
);

export type GetAffiliateViewerQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetAffiliateViewerQuery = (
  { __typename?: 'query_root' }
  & { users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & Pick<Users, 'affiliateRevenueShare'>
    & { affiliateLinkClicks_aggregate: (
      { __typename?: 'affiliate_link_clicks_aggregate' }
      & { aggregate?: Maybe<(
        { __typename?: 'affiliate_link_clicks_aggregate_fields' }
        & Pick<Affiliate_Link_Clicks_Aggregate_Fields, 'count'>
      )> }
    ), affiliateSales: Array<(
      { __typename?: 'affiliate_sales' }
      & Pick<Affiliate_Sales, 'id' | 'affiliateAmountEarned' | 'affiliateUserId' | 'amountPaid' | 'createdAt' | 'type' | 'updatedAt'>
    )>, affiliateReferralClickCounts: Array<(
      { __typename?: 'affiliate_referral_click_counts' }
      & Pick<Affiliate_Referral_Click_Counts, 'affiliateUserId' | 'count' | 'mostRecentDate' | 'referralUrl'>
    )> }
    & UserAsViewerFragment
  )> }
);

export type GetUserSettingsQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetUserSettingsQuery = (
  { __typename?: 'query_root' }
  & { users_by_pk?: Maybe<(
    { __typename?: 'users' }
    & Pick<Users, 'theme' | 'affiliateId' | 'createdAt' | 'email' | 'id' | 'name' | 'role' | 'preferredCodingLanguage' | 'registrationSource' | 'fullCourseAccessEndsAt' | 'fullCourseAccessLatestUpgradedAt' | 'fullCourseAccessFirstUpgradedAt'>
    & { activeLesson?: Maybe<(
      { __typename?: 'lessons' }
      & Pick<Lessons, 'id' | 'slug' | 'title' | 'description'>
    )>, sentGiftCards: Array<(
      { __typename?: 'gift_cards' }
      & Pick<Gift_Cards, 'id' | 'giftNote' | 'creditAmountDollars' | 'productAccessDays' | 'productDescription' | 'productName' | 'productType' | 'receiverEmail' | 'status' | 'code'>
    )>, receivedGiftCards: Array<(
      { __typename?: 'gift_cards' }
      & Pick<Gift_Cards, 'id' | 'giftNote' | 'creditAmountDollars' | 'productAccessDays' | 'productDescription' | 'productName' | 'productType' | 'receiverEmail' | 'status' | 'code'>
    )>, redeemedGiftCards: Array<(
      { __typename?: 'gift_cards' }
      & Pick<Gift_Cards, 'id' | 'giftNote' | 'creditAmountDollars' | 'productAccessDays' | 'productDescription' | 'productName' | 'productType' | 'receiverEmail' | 'status' | 'code' | 'redeemedAt'>
    )> }
    & UserAsViewerFragment
  )> }
);

export const CategoryLessonsFragmentDoc = gql`
    fragment categoryLessons on categories {
  id
  position
  previewVideo
  title
  description
  slug
  lessons(order_by: {position: asc}, where: {position: {_is_null: false}, status: {_eq: "ACTIVE"}}) {
    accessLevel
    description
    position
    slug
    title
    type
    id
  }
}
    `;
export const UserAsViewerFragmentDoc = gql`
    fragment userAsViewer on users {
  id
  preferredCodingLanguage
  registrationSource
  role
  theme
  name
  email
  fullCourseAccessEndsAt
  fullCourseAccessLatestUpgradedAt
  fullCourseAccessFirstUpgradedAt
  affiliateId
  affiliateStatus
  activeLesson {
    id
    slug
    title
    description
  }
}
    `;
export const GetCategoryLessonsDocument = gql`
    query getCategoryLessons {
  categories(order_by: {position: asc}) {
    ...categoryLessons
  }
}
    ${CategoryLessonsFragmentDoc}`;

/**
 * __useGetCategoryLessonsQuery__
 *
 * To run a query within a React component, call `useGetCategoryLessonsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryLessonsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryLessonsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoryLessonsQuery(baseOptions?: Apollo.QueryHookOptions<GetCategoryLessonsQuery, GetCategoryLessonsQueryVariables>) {
        return Apollo.useQuery<GetCategoryLessonsQuery, GetCategoryLessonsQueryVariables>(GetCategoryLessonsDocument, baseOptions);
      }
export function useGetCategoryLessonsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryLessonsQuery, GetCategoryLessonsQueryVariables>) {
          return Apollo.useLazyQuery<GetCategoryLessonsQuery, GetCategoryLessonsQueryVariables>(GetCategoryLessonsDocument, baseOptions);
        }
export type GetCategoryLessonsQueryHookResult = ReturnType<typeof useGetCategoryLessonsQuery>;
export type GetCategoryLessonsLazyQueryHookResult = ReturnType<typeof useGetCategoryLessonsLazyQuery>;
export type GetCategoryLessonsQueryResult = Apollo.QueryResult<GetCategoryLessonsQuery, GetCategoryLessonsQueryVariables>;
export const GetCategoryLessonsWithViewerDocument = gql`
    query getCategoryLessonsWithViewer($userId: String!) {
  categories(order_by: {position: asc}) {
    ...categoryLessons
  }
  users_lessons_status(where: {userId: {_eq: $userId}}) {
    explanationStepsViewed
    validationStepsViewed
    status
    lessonId
    userId
    notes
  }
  users_by_pk(id: $userId) {
    ...userAsViewer
  }
}
    ${CategoryLessonsFragmentDoc}
${UserAsViewerFragmentDoc}`;

/**
 * __useGetCategoryLessonsWithViewerQuery__
 *
 * To run a query within a React component, call `useGetCategoryLessonsWithViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryLessonsWithViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryLessonsWithViewerQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetCategoryLessonsWithViewerQuery(baseOptions: Apollo.QueryHookOptions<GetCategoryLessonsWithViewerQuery, GetCategoryLessonsWithViewerQueryVariables>) {
        return Apollo.useQuery<GetCategoryLessonsWithViewerQuery, GetCategoryLessonsWithViewerQueryVariables>(GetCategoryLessonsWithViewerDocument, baseOptions);
      }
export function useGetCategoryLessonsWithViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryLessonsWithViewerQuery, GetCategoryLessonsWithViewerQueryVariables>) {
          return Apollo.useLazyQuery<GetCategoryLessonsWithViewerQuery, GetCategoryLessonsWithViewerQueryVariables>(GetCategoryLessonsWithViewerDocument, baseOptions);
        }
export type GetCategoryLessonsWithViewerQueryHookResult = ReturnType<typeof useGetCategoryLessonsWithViewerQuery>;
export type GetCategoryLessonsWithViewerLazyQueryHookResult = ReturnType<typeof useGetCategoryLessonsWithViewerLazyQuery>;
export type GetCategoryLessonsWithViewerQueryResult = Apollo.QueryResult<GetCategoryLessonsWithViewerQuery, GetCategoryLessonsWithViewerQueryVariables>;
export const UpdatePreferredCodingLanguageDocument = gql`
    mutation updatePreferredCodingLanguage($id: String!, $preferredCodingLanguage: String!) {
  update_users_by_pk(pk_columns: {id: $id}, _set: {preferredCodingLanguage: $preferredCodingLanguage}) {
    id
  }
}
    `;
export type UpdatePreferredCodingLanguageMutationFn = Apollo.MutationFunction<UpdatePreferredCodingLanguageMutation, UpdatePreferredCodingLanguageMutationVariables>;

/**
 * __useUpdatePreferredCodingLanguageMutation__
 *
 * To run a mutation, you first call `useUpdatePreferredCodingLanguageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePreferredCodingLanguageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePreferredCodingLanguageMutation, { data, loading, error }] = useUpdatePreferredCodingLanguageMutation({
 *   variables: {
 *      id: // value for 'id'
 *      preferredCodingLanguage: // value for 'preferredCodingLanguage'
 *   },
 * });
 */
export function useUpdatePreferredCodingLanguageMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePreferredCodingLanguageMutation, UpdatePreferredCodingLanguageMutationVariables>) {
        return Apollo.useMutation<UpdatePreferredCodingLanguageMutation, UpdatePreferredCodingLanguageMutationVariables>(UpdatePreferredCodingLanguageDocument, baseOptions);
      }
export type UpdatePreferredCodingLanguageMutationHookResult = ReturnType<typeof useUpdatePreferredCodingLanguageMutation>;
export type UpdatePreferredCodingLanguageMutationResult = Apollo.MutationResult<UpdatePreferredCodingLanguageMutation>;
export type UpdatePreferredCodingLanguageMutationOptions = Apollo.BaseMutationOptions<UpdatePreferredCodingLanguageMutation, UpdatePreferredCodingLanguageMutationVariables>;
export const InsertLessonStatusDocument = gql`
    mutation insertLessonStatus($lessonId: uuid!, $userId: String!, $explanationStepsViewed: Int! = 0, $validationStepsViewed: Int! = 0, $status: String!) {
  insert_users_lessons_status(objects: {explanationStepsViewed: $explanationStepsViewed, validationStepsViewed: $validationStepsViewed, lessonId: $lessonId, userId: $userId, status: $status}, on_conflict: {constraint: users_lessons_status_pkey, update_columns: [status, explanationStepsViewed, validationStepsViewed]}) {
    returning {
      validationStepsViewed
      status
      lessonId
      userId
      explanationStepsViewed
    }
  }
}
    `;
export type InsertLessonStatusMutationFn = Apollo.MutationFunction<InsertLessonStatusMutation, InsertLessonStatusMutationVariables>;

/**
 * __useInsertLessonStatusMutation__
 *
 * To run a mutation, you first call `useInsertLessonStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertLessonStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertLessonStatusMutation, { data, loading, error }] = useInsertLessonStatusMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      userId: // value for 'userId'
 *      explanationStepsViewed: // value for 'explanationStepsViewed'
 *      validationStepsViewed: // value for 'validationStepsViewed'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useInsertLessonStatusMutation(baseOptions?: Apollo.MutationHookOptions<InsertLessonStatusMutation, InsertLessonStatusMutationVariables>) {
        return Apollo.useMutation<InsertLessonStatusMutation, InsertLessonStatusMutationVariables>(InsertLessonStatusDocument, baseOptions);
      }
export type InsertLessonStatusMutationHookResult = ReturnType<typeof useInsertLessonStatusMutation>;
export type InsertLessonStatusMutationResult = Apollo.MutationResult<InsertLessonStatusMutation>;
export type InsertLessonStatusMutationOptions = Apollo.BaseMutationOptions<InsertLessonStatusMutation, InsertLessonStatusMutationVariables>;
export const SetActiveLessonDocument = gql`
    mutation setActiveLesson($userId: String!, $lessonId: uuid!) {
  update_users(where: {id: {_eq: $userId}}, _set: {activeLessonId: $lessonId}) {
    returning {
      id
      activeLesson {
        id
        slug
      }
    }
  }
}
    `;
export type SetActiveLessonMutationFn = Apollo.MutationFunction<SetActiveLessonMutation, SetActiveLessonMutationVariables>;

/**
 * __useSetActiveLessonMutation__
 *
 * To run a mutation, you first call `useSetActiveLessonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetActiveLessonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setActiveLessonMutation, { data, loading, error }] = useSetActiveLessonMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      lessonId: // value for 'lessonId'
 *   },
 * });
 */
export function useSetActiveLessonMutation(baseOptions?: Apollo.MutationHookOptions<SetActiveLessonMutation, SetActiveLessonMutationVariables>) {
        return Apollo.useMutation<SetActiveLessonMutation, SetActiveLessonMutationVariables>(SetActiveLessonDocument, baseOptions);
      }
export type SetActiveLessonMutationHookResult = ReturnType<typeof useSetActiveLessonMutation>;
export type SetActiveLessonMutationResult = Apollo.MutationResult<SetActiveLessonMutation>;
export type SetActiveLessonMutationOptions = Apollo.BaseMutationOptions<SetActiveLessonMutation, SetActiveLessonMutationVariables>;
export const SetFinishLessonStatusDocument = gql`
    mutation setFinishLessonStatus($lessonId: uuid!, $userId: String!, $status: String!, $confidence: Int!) {
  update_users_lessons_status(_set: {status: $status, confidence: $confidence}, where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId}}) {
    returning {
      validationStepsViewed
      status
      explanationStepsViewed
      lessonId
      userId
    }
  }
}
    `;
export type SetFinishLessonStatusMutationFn = Apollo.MutationFunction<SetFinishLessonStatusMutation, SetFinishLessonStatusMutationVariables>;

/**
 * __useSetFinishLessonStatusMutation__
 *
 * To run a mutation, you first call `useSetFinishLessonStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetFinishLessonStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setFinishLessonStatusMutation, { data, loading, error }] = useSetFinishLessonStatusMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      userId: // value for 'userId'
 *      status: // value for 'status'
 *      confidence: // value for 'confidence'
 *   },
 * });
 */
export function useSetFinishLessonStatusMutation(baseOptions?: Apollo.MutationHookOptions<SetFinishLessonStatusMutation, SetFinishLessonStatusMutationVariables>) {
        return Apollo.useMutation<SetFinishLessonStatusMutation, SetFinishLessonStatusMutationVariables>(SetFinishLessonStatusDocument, baseOptions);
      }
export type SetFinishLessonStatusMutationHookResult = ReturnType<typeof useSetFinishLessonStatusMutation>;
export type SetFinishLessonStatusMutationResult = Apollo.MutationResult<SetFinishLessonStatusMutation>;
export type SetFinishLessonStatusMutationOptions = Apollo.BaseMutationOptions<SetFinishLessonStatusMutation, SetFinishLessonStatusMutationVariables>;
export const UpdateUserLessonNotesDocument = gql`
    mutation updateUserLessonNotes($lessonId: uuid!, $userId: String!, $notes: String) {
  update_users_lessons_status_by_pk(_set: {notes: $notes}, pk_columns: {lessonId: $lessonId, userId: $userId}) {
    status
    explanationStepsViewed
    validationStepsViewed
    confidence
    lessonId
    userId
    notes
  }
}
    `;
export type UpdateUserLessonNotesMutationFn = Apollo.MutationFunction<UpdateUserLessonNotesMutation, UpdateUserLessonNotesMutationVariables>;

/**
 * __useUpdateUserLessonNotesMutation__
 *
 * To run a mutation, you first call `useUpdateUserLessonNotesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserLessonNotesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserLessonNotesMutation, { data, loading, error }] = useUpdateUserLessonNotesMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      userId: // value for 'userId'
 *      notes: // value for 'notes'
 *   },
 * });
 */
export function useUpdateUserLessonNotesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserLessonNotesMutation, UpdateUserLessonNotesMutationVariables>) {
        return Apollo.useMutation<UpdateUserLessonNotesMutation, UpdateUserLessonNotesMutationVariables>(UpdateUserLessonNotesDocument, baseOptions);
      }
export type UpdateUserLessonNotesMutationHookResult = ReturnType<typeof useUpdateUserLessonNotesMutation>;
export type UpdateUserLessonNotesMutationResult = Apollo.MutationResult<UpdateUserLessonNotesMutation>;
export type UpdateUserLessonNotesMutationOptions = Apollo.BaseMutationOptions<UpdateUserLessonNotesMutation, UpdateUserLessonNotesMutationVariables>;
export const UpdateUserSavedCodeDocument = gql`
    mutation updateUserSavedCode($lessonId: uuid!, $userId: String!, $code: String, $language: String!) {
  insert_code_drafts(objects: {code: $code, lessonId: $lessonId, language: $language, userId: $userId}, on_conflict: {constraint: code_drafts_language_userId_lessonId_key, update_columns: code}) {
    returning {
      code
      createdAt
      id
      language
      lessonId
      updatedAt
      userId
    }
  }
}
    `;
export type UpdateUserSavedCodeMutationFn = Apollo.MutationFunction<UpdateUserSavedCodeMutation, UpdateUserSavedCodeMutationVariables>;

/**
 * __useUpdateUserSavedCodeMutation__
 *
 * To run a mutation, you first call `useUpdateUserSavedCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserSavedCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserSavedCodeMutation, { data, loading, error }] = useUpdateUserSavedCodeMutation({
 *   variables: {
 *      lessonId: // value for 'lessonId'
 *      userId: // value for 'userId'
 *      code: // value for 'code'
 *      language: // value for 'language'
 *   },
 * });
 */
export function useUpdateUserSavedCodeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserSavedCodeMutation, UpdateUserSavedCodeMutationVariables>) {
        return Apollo.useMutation<UpdateUserSavedCodeMutation, UpdateUserSavedCodeMutationVariables>(UpdateUserSavedCodeDocument, baseOptions);
      }
export type UpdateUserSavedCodeMutationHookResult = ReturnType<typeof useUpdateUserSavedCodeMutation>;
export type UpdateUserSavedCodeMutationResult = Apollo.MutationResult<UpdateUserSavedCodeMutation>;
export type UpdateUserSavedCodeMutationOptions = Apollo.BaseMutationOptions<UpdateUserSavedCodeMutation, UpdateUserSavedCodeMutationVariables>;
export const GetCodeSubmissionByTokenDocument = gql`
    query getCodeSubmissionByToken($codeRunnerToken: String!) {
  code_submissions(where: {codeRunnerToken: {_eq: $codeRunnerToken}, executionStatus: {_neq: "EXECUTING"}}, limit: 1) {
    code
    codeRunnerStatusDescription
    codeRunnerStatusId
    codeRunnerToken
    compileOutput
    compileOutputDecoded
    createdAt
    diagnostics
    environment
    executionStatus
    id
    language
    memory
    message
    messageDecoded
    resultStatus
    results
    runnerVersion
    logs
    stderr
    stderrDecoded
    stdout
    stdoutDecoded
    tests
    time
    validator
  }
}
    `;

/**
 * __useGetCodeSubmissionByTokenQuery__
 *
 * To run a query within a React component, call `useGetCodeSubmissionByTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCodeSubmissionByTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCodeSubmissionByTokenQuery({
 *   variables: {
 *      codeRunnerToken: // value for 'codeRunnerToken'
 *   },
 * });
 */
export function useGetCodeSubmissionByTokenQuery(baseOptions: Apollo.QueryHookOptions<GetCodeSubmissionByTokenQuery, GetCodeSubmissionByTokenQueryVariables>) {
        return Apollo.useQuery<GetCodeSubmissionByTokenQuery, GetCodeSubmissionByTokenQueryVariables>(GetCodeSubmissionByTokenDocument, baseOptions);
      }
export function useGetCodeSubmissionByTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCodeSubmissionByTokenQuery, GetCodeSubmissionByTokenQueryVariables>) {
          return Apollo.useLazyQuery<GetCodeSubmissionByTokenQuery, GetCodeSubmissionByTokenQueryVariables>(GetCodeSubmissionByTokenDocument, baseOptions);
        }
export type GetCodeSubmissionByTokenQueryHookResult = ReturnType<typeof useGetCodeSubmissionByTokenQuery>;
export type GetCodeSubmissionByTokenLazyQueryHookResult = ReturnType<typeof useGetCodeSubmissionByTokenLazyQuery>;
export type GetCodeSubmissionByTokenQueryResult = Apollo.QueryResult<GetCodeSubmissionByTokenQuery, GetCodeSubmissionByTokenQueryVariables>;
export const GetLessonBySlugWithViewerDocument = gql`
    query getLessonBySlugWithViewer($slug: String!, $userId: String!) {
  lessons(where: {slug: {_eq: $slug}, status: {_eq: "ACTIVE"}}) {
    title
    slug
    position
    id
    description
    accessLevel
    introductionVideoUrl
    type
    metaTitle
    metaDescription
    status
    category {
      title
      slug
      id
    }
  }
  users_by_pk(id: $userId) {
    ...userAsViewer
  }
  users_lessons_status(where: {lesson: {slug: {_eq: $slug}}, userId: {_eq: $userId}}) {
    status
    explanationStepsViewed
    validationStepsViewed
    confidence
    lessonId
    userId
    notes
  }
  code_drafts(where: {lesson: {slug: {_eq: $slug}}, userId: {_eq: $userId}}) {
    code
    createdAt
    id
    language
    lessonId
    updatedAt
    userId
  }
}
    ${UserAsViewerFragmentDoc}`;

/**
 * __useGetLessonBySlugWithViewerQuery__
 *
 * To run a query within a React component, call `useGetLessonBySlugWithViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLessonBySlugWithViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLessonBySlugWithViewerQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLessonBySlugWithViewerQuery(baseOptions: Apollo.QueryHookOptions<GetLessonBySlugWithViewerQuery, GetLessonBySlugWithViewerQueryVariables>) {
        return Apollo.useQuery<GetLessonBySlugWithViewerQuery, GetLessonBySlugWithViewerQueryVariables>(GetLessonBySlugWithViewerDocument, baseOptions);
      }
export function useGetLessonBySlugWithViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLessonBySlugWithViewerQuery, GetLessonBySlugWithViewerQueryVariables>) {
          return Apollo.useLazyQuery<GetLessonBySlugWithViewerQuery, GetLessonBySlugWithViewerQueryVariables>(GetLessonBySlugWithViewerDocument, baseOptions);
        }
export type GetLessonBySlugWithViewerQueryHookResult = ReturnType<typeof useGetLessonBySlugWithViewerQuery>;
export type GetLessonBySlugWithViewerLazyQueryHookResult = ReturnType<typeof useGetLessonBySlugWithViewerLazyQuery>;
export type GetLessonBySlugWithViewerQueryResult = Apollo.QueryResult<GetLessonBySlugWithViewerQuery, GetLessonBySlugWithViewerQueryVariables>;
export const GetLessonsDocument = gql`
    query getLessons {
  lessons(order_by: {position: asc}, where: {position: {_is_null: false}, status: {_eq: "ACTIVE"}}) {
    id
    title
    slug
    position
    description
    accessLevel
    introductionVideoUrl
  }
}
    `;

/**
 * __useGetLessonsQuery__
 *
 * To run a query within a React component, call `useGetLessonsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLessonsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLessonsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLessonsQuery(baseOptions?: Apollo.QueryHookOptions<GetLessonsQuery, GetLessonsQueryVariables>) {
        return Apollo.useQuery<GetLessonsQuery, GetLessonsQueryVariables>(GetLessonsDocument, baseOptions);
      }
export function useGetLessonsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLessonsQuery, GetLessonsQueryVariables>) {
          return Apollo.useLazyQuery<GetLessonsQuery, GetLessonsQueryVariables>(GetLessonsDocument, baseOptions);
        }
export type GetLessonsQueryHookResult = ReturnType<typeof useGetLessonsQuery>;
export type GetLessonsLazyQueryHookResult = ReturnType<typeof useGetLessonsLazyQuery>;
export type GetLessonsQueryResult = Apollo.QueryResult<GetLessonsQuery, GetLessonsQueryVariables>;
export const GetLessonBySlugDocument = gql`
    query getLessonBySlug($slug: String!) {
  lessons(where: {slug: {_eq: $slug}, status: {_eq: "ACTIVE"}}) {
    title
    slug
    position
    id
    description
    accessLevel
    introductionVideoUrl
    type
    metaTitle
    metaDescription
    status
    category {
      id
      title
      slug
    }
  }
}
    `;

/**
 * __useGetLessonBySlugQuery__
 *
 * To run a query within a React component, call `useGetLessonBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLessonBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLessonBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetLessonBySlugQuery(baseOptions: Apollo.QueryHookOptions<GetLessonBySlugQuery, GetLessonBySlugQueryVariables>) {
        return Apollo.useQuery<GetLessonBySlugQuery, GetLessonBySlugQueryVariables>(GetLessonBySlugDocument, baseOptions);
      }
export function useGetLessonBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLessonBySlugQuery, GetLessonBySlugQueryVariables>) {
          return Apollo.useLazyQuery<GetLessonBySlugQuery, GetLessonBySlugQueryVariables>(GetLessonBySlugDocument, baseOptions);
        }
export type GetLessonBySlugQueryHookResult = ReturnType<typeof useGetLessonBySlugQuery>;
export type GetLessonBySlugLazyQueryHookResult = ReturnType<typeof useGetLessonBySlugLazyQuery>;
export type GetLessonBySlugQueryResult = Apollo.QueryResult<GetLessonBySlugQuery, GetLessonBySlugQueryVariables>;
export const GetViewerDocument = gql`
    query getViewer($id: String!) {
  users_by_pk(id: $id) {
    ...userAsViewer
  }
}
    ${UserAsViewerFragmentDoc}`;

/**
 * __useGetViewerQuery__
 *
 * To run a query within a React component, call `useGetViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetViewerQuery(baseOptions: Apollo.QueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
        return Apollo.useQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, baseOptions);
      }
export function useGetViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
          return Apollo.useLazyQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, baseOptions);
        }
export type GetViewerQueryHookResult = ReturnType<typeof useGetViewerQuery>;
export type GetViewerLazyQueryHookResult = ReturnType<typeof useGetViewerLazyQuery>;
export type GetViewerQueryResult = Apollo.QueryResult<GetViewerQuery, GetViewerQueryVariables>;
export const GetAffiliateViewerDocument = gql`
    query getAffiliateViewer($id: String!) {
  users_by_pk(id: $id) {
    ...userAsViewer
    affiliateRevenueShare
    affiliateLinkClicks_aggregate(where: {affiliateUserId: {_eq: $id}}) {
      aggregate {
        count(columns: referralUrl)
      }
    }
    affiliateSales {
      id
      affiliateAmountEarned
      affiliateUserId
      amountPaid
      createdAt
      type
      updatedAt
    }
    affiliateReferralClickCounts {
      affiliateUserId
      count
      mostRecentDate
      referralUrl
    }
  }
}
    ${UserAsViewerFragmentDoc}`;

/**
 * __useGetAffiliateViewerQuery__
 *
 * To run a query within a React component, call `useGetAffiliateViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAffiliateViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAffiliateViewerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAffiliateViewerQuery(baseOptions: Apollo.QueryHookOptions<GetAffiliateViewerQuery, GetAffiliateViewerQueryVariables>) {
        return Apollo.useQuery<GetAffiliateViewerQuery, GetAffiliateViewerQueryVariables>(GetAffiliateViewerDocument, baseOptions);
      }
export function useGetAffiliateViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAffiliateViewerQuery, GetAffiliateViewerQueryVariables>) {
          return Apollo.useLazyQuery<GetAffiliateViewerQuery, GetAffiliateViewerQueryVariables>(GetAffiliateViewerDocument, baseOptions);
        }
export type GetAffiliateViewerQueryHookResult = ReturnType<typeof useGetAffiliateViewerQuery>;
export type GetAffiliateViewerLazyQueryHookResult = ReturnType<typeof useGetAffiliateViewerLazyQuery>;
export type GetAffiliateViewerQueryResult = Apollo.QueryResult<GetAffiliateViewerQuery, GetAffiliateViewerQueryVariables>;
export const GetUserSettingsDocument = gql`
    query getUserSettings($id: String!) {
  users_by_pk(id: $id) {
    ...userAsViewer
    theme
    affiliateId
    createdAt
    email
    id
    name
    role
    preferredCodingLanguage
    registrationSource
    fullCourseAccessEndsAt
    fullCourseAccessLatestUpgradedAt
    fullCourseAccessFirstUpgradedAt
    activeLesson {
      id
      slug
      title
      description
    }
    sentGiftCards(where: {status: {_eq: "ISSUED"}}) {
      id
      giftNote
      creditAmountDollars
      productAccessDays
      productDescription
      productName
      productType
      receiverEmail
      status
      code
    }
    receivedGiftCards(where: {status: {_eq: "ISSUED"}}) {
      id
      giftNote
      creditAmountDollars
      productAccessDays
      productDescription
      productName
      productType
      receiverEmail
      status
      code
    }
    redeemedGiftCards(where: {status: {_eq: "REDEEMED"}}) {
      id
      giftNote
      creditAmountDollars
      productAccessDays
      productDescription
      productName
      productType
      receiverEmail
      status
      code
      redeemedAt
    }
  }
}
    ${UserAsViewerFragmentDoc}`;

/**
 * __useGetUserSettingsQuery__
 *
 * To run a query within a React component, call `useGetUserSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSettingsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserSettingsQuery(baseOptions: Apollo.QueryHookOptions<GetUserSettingsQuery, GetUserSettingsQueryVariables>) {
        return Apollo.useQuery<GetUserSettingsQuery, GetUserSettingsQueryVariables>(GetUserSettingsDocument, baseOptions);
      }
export function useGetUserSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserSettingsQuery, GetUserSettingsQueryVariables>) {
          return Apollo.useLazyQuery<GetUserSettingsQuery, GetUserSettingsQueryVariables>(GetUserSettingsDocument, baseOptions);
        }
export type GetUserSettingsQueryHookResult = ReturnType<typeof useGetUserSettingsQuery>;
export type GetUserSettingsLazyQueryHookResult = ReturnType<typeof useGetUserSettingsLazyQuery>;
export type GetUserSettingsQueryResult = Apollo.QueryResult<GetUserSettingsQuery, GetUserSettingsQueryVariables>;