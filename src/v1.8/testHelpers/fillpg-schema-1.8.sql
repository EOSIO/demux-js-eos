--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 11.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: "${schema^}"; Type: SCHEMA; Schema: -; Owner: docker
--

CREATE SCHEMA "${schema^}";


ALTER SCHEMA "${schema^}" OWNER TO "docker";

--
-- Name: activated_protocol_feature_v0; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".activated_protocol_feature_v0 AS (
	feature_digest character varying(64),
	activation_block_num bigint
);


ALTER TYPE "${schema^}".activated_protocol_feature_v0 OWNER TO "docker";

--
-- Name: key_weight; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".key_weight AS (
	key character varying,
	weight integer
);


ALTER TYPE "${schema^}".key_weight OWNER TO "docker";

--
-- Name: permission_level_weight; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".permission_level_weight AS (
	permission_actor character varying(13),
	permission_permission character varying(13),
	weight integer
);


ALTER TYPE "${schema^}".permission_level_weight OWNER TO "docker";

--
-- Name: producer_key; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".producer_key AS (
	producer_name character varying(13),
	block_signing_key character varying
);


ALTER TYPE "${schema^}".producer_key OWNER TO "docker";

--
-- Name: transaction_status_type; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".transaction_status_type AS ENUM (
    'executed',
    'soft_fail',
    'hard_fail',
    'delayed',
    'expired'
);


ALTER TYPE "${schema^}".transaction_status_type OWNER TO "docker";

--
-- Name: wait_weight; Type: TYPE; Schema: "${schema^}"; Owner: docker
--

CREATE TYPE "${schema^}".wait_weight AS (
	wait_sec bigint,
	weight integer
);


ALTER TYPE "${schema^}".wait_weight OWNER TO "docker";

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: account; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".account (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    name character varying(13) NOT NULL,
    creation_date timestamp without time zone,
    abi bytea
);


ALTER TABLE "${schema^}".account OWNER TO "docker";

--
-- Name: account_metadata; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".account_metadata (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    name character varying(13) NOT NULL,
    privileged boolean,
    last_code_update timestamp without time zone,
    code_present boolean,
    code_vm_type smallint,
    code_vm_version smallint,
    code_code_hash character varying(64)
);


ALTER TABLE "${schema^}".account_metadata OWNER TO "docker";

--
-- Name: action_trace; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".action_trace (
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    transaction_status "${schema^}".transaction_status_type,
    action_ordinal bigint NOT NULL,
    creator_action_ordinal bigint,
    receipt_present boolean,
    receipt_receiver character varying(13),
    receipt_act_digest character varying(64),
    receipt_global_sequence numeric,
    receipt_recv_sequence numeric,
    receipt_code_sequence bigint,
    receipt_abi_sequence bigint,
    receiver character varying(13),
    act_account character varying(13),
    act_name character varying(13),
    act_data bytea,
    context_free boolean,
    elapsed bigint,
    console character varying,
    "except" character varying,
    error_code numeric
);


ALTER TABLE "${schema^}".action_trace OWNER TO "docker";

--
-- Name: action_trace_auth_sequence; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".action_trace_auth_sequence (
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    action_ordinal integer NOT NULL,
    ordinal integer NOT NULL,
    transaction_status "${schema^}".transaction_status_type,
    account character varying(13),
    sequence numeric
);


ALTER TABLE "${schema^}".action_trace_auth_sequence OWNER TO "docker";

--
-- Name: action_trace_authorization; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".action_trace_authorization (
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    action_ordinal integer NOT NULL,
    ordinal integer NOT NULL,
    transaction_status "${schema^}".transaction_status_type,
    actor character varying(13),
    permission character varying(13)
);


ALTER TABLE "${schema^}".action_trace_authorization OWNER TO "docker";

--
-- Name: action_trace_ram_delta; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".action_trace_ram_delta (
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    action_ordinal integer NOT NULL,
    ordinal integer NOT NULL,
    transaction_status "${schema^}".transaction_status_type,
    account character varying(13),
    delta bigint
);


ALTER TABLE "${schema^}".action_trace_ram_delta OWNER TO "docker";

--
-- Name: b1_account; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_account (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    "user" character varying(13),
    earnings_income bigint,
    balance bigint,
    start_time timestamp without time zone,
    last_claim_time timestamp without time zone,
    locked_until timestamp without time zone,
    active_records integer,
    is_business boolean
);


ALTER TABLE "${schema^}".b1_account OWNER TO "docker";

--
-- Name: b1_accounts; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_accounts (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    "user" character varying(13),
    earnings_income bigint,
    balance bigint,
    start_time timestamp without time zone,
    last_claim_time timestamp without time zone,
    locked_until timestamp without time zone,
    active_records integer,
    is_business boolean
);


ALTER TABLE "${schema^}".b1_accounts OWNER TO "docker";

--
-- Name: b1_accountstat; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_accountstat (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    population bigint,
    business_population bigint
);


ALTER TABLE "${schema^}".b1_accountstat OWNER TO "docker";

--
-- Name: b1_activelikes; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_activelikes (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    key numeric,
    entity_author character varying(13),
    entity_type smallint,
    entity_id numeric,
    last_update_time timestamp without time zone,
    likes_count integer
);


ALTER TABLE "${schema^}".b1_activelikes OWNER TO "docker";

--
-- Name: b1_categories; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_categories (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    category character varying(13)
);


ALTER TABLE "${schema^}".b1_categories OWNER TO "docker";

--
-- Name: b1_moderators; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_moderators (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    "user" character varying(13),
    added_by character varying(13),
    added_time timestamp without time zone,
    can_hide boolean,
    can_accept_post boolean,
    can_lock_account boolean,
    can_manage_moderators boolean
);


ALTER TABLE "${schema^}".b1_moderators OWNER TO "docker";

--
-- Name: b1_mtndellike; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_mtndellike (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    key numeric,
    entity_author character varying(13),
    entity_type smallint,
    entity_id numeric
);


ALTER TABLE "${schema^}".b1_mtndellike OWNER TO "docker";

--
-- Name: b1_mtndellikes; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_mtndellikes (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    key numeric,
    entity_author character varying(13),
    entity_type smallint,
    entity_id numeric,
    liker character varying(13)
);


ALTER TABLE "${schema^}".b1_mtndellikes OWNER TO "docker";

--
-- Name: b1_rewardstat; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_rewardstat (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    avg_likes_sum bigint,
    reward_pool_amount bigint,
    last_reward_time timestamp without time zone
);


ALTER TABLE "${schema^}".b1_rewardstat OWNER TO "docker";

--
-- Name: b1_rptdecisions; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_rptdecisions (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    decision character varying(13),
    hide_post boolean,
    accept_post boolean
);


ALTER TABLE "${schema^}".b1_rptdecisions OWNER TO "docker";

--
-- Name: b1_rptreasons; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_rptreasons (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    reason character varying(13),
    weight smallint
);


ALTER TABLE "${schema^}".b1_rptreasons OWNER TO "docker";

--
-- Name: b1_tokenstat; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_tokenstat (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    supply numeric,
    pending_earnings numeric
);


ALTER TABLE "${schema^}".b1_tokenstat OWNER TO "docker";

--
-- Name: b1_topvoices; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_topvoices (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    key numeric,
    entity_author character varying(13),
    entity_type smallint,
    entity_id numeric,
    top character varying(13),
    paid bigint,
    num_voices integer,
    create_time timestamp without time zone,
    last_voice_time timestamp without time zone
);


ALTER TABLE "${schema^}".b1_topvoices OWNER TO "docker";

--
-- Name: b1_userlikes; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".b1_userlikes (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    primary_key numeric NOT NULL,
    key numeric,
    entity_author character varying(13),
    entity_type smallint,
    entity_id numeric,
    liker character varying(13)
);


ALTER TABLE "${schema^}".b1_userlikes OWNER TO "docker";

--
-- Name: block_info; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".block_info (
    block_num bigint NOT NULL,
    block_id character varying(64),
    "timestamp" timestamp without time zone,
    producer character varying(13),
    confirmed integer,
    previous character varying(64),
    transaction_mroot character varying(64),
    action_mroot character varying(64),
    schedule_version bigint,
    new_producers_version bigint,
    new_producers "${schema^}".producer_key[]
);


ALTER TABLE "${schema^}".block_info OWNER TO "docker";

--
-- Name: code; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".code (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    vm_type smallint NOT NULL,
    vm_version smallint NOT NULL,
    code_hash character varying(64) NOT NULL,
    code bytea
);


ALTER TABLE "${schema^}".code OWNER TO "docker";

--
-- Name: contract_index128; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_index128 (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    secondary_key numeric
);


ALTER TABLE "${schema^}".contract_index128 OWNER TO "docker";

--
-- Name: contract_index256; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_index256 (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    secondary_key character varying(64)
);


ALTER TABLE "${schema^}".contract_index256 OWNER TO "docker";

--
-- Name: contract_index64; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_index64 (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    secondary_key numeric
);


ALTER TABLE "${schema^}".contract_index64 OWNER TO "docker";

--
-- Name: contract_index_double; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_index_double (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    secondary_key double precision
);


ALTER TABLE "${schema^}".contract_index_double OWNER TO "docker";

--
-- Name: contract_index_long_double; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_index_long_double (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    secondary_key bytea
);


ALTER TABLE "${schema^}".contract_index_long_double OWNER TO "docker";

--
-- Name: contract_row; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_row (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    primary_key numeric NOT NULL,
    payer character varying(13),
    value bytea
);


ALTER TABLE "${schema^}".contract_row OWNER TO "docker";

--
-- Name: contract_table; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".contract_table (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    code character varying(13) NOT NULL,
    scope character varying(13) NOT NULL,
    "table" character varying(13) NOT NULL,
    payer character varying(13)
);


ALTER TABLE "${schema^}".contract_table OWNER TO "docker";

--
-- Name: fill_status; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".fill_status (
    head bigint,
    head_id character varying(64),
    irreversible bigint,
    irreversible_id character varying(64),
    first bigint
);


ALTER TABLE "${schema^}".fill_status OWNER TO "docker";

--
-- Name: generated_transaction; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".generated_transaction (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    sender character varying(13) NOT NULL,
    sender_id numeric NOT NULL,
    payer character varying(13),
    trx_id character varying(64),
    packed_trx bytea
);


ALTER TABLE "${schema^}".generated_transaction OWNER TO "docker";

--
-- Name: global_property; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".global_property (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    proposed_schedule_block_num bigint,
    proposed_schedule_version bigint,
    proposed_schedule_producers "${schema^}".producer_key[],
    configuration_max_block_net_usage numeric,
    configuration_target_block_net_usage_pct bigint,
    configuration_max_transaction_net_usage bigint,
    configuration_base_per_transaction_net_usage bigint,
    configuration_net_usage_leeway bigint,
    configuration_context_free_discount_net_usage_num bigint,
    configuration_context_free_discount_net_usage_den bigint,
    configuration_max_block_cpu_usage bigint,
    configuration_target_block_cpu_usage_pct bigint,
    configuration_max_transaction_cpu_usage bigint,
    configuration_min_transaction_cpu_usage bigint,
    configuration_max_transaction_lifetime bigint,
    configuration_deferred_trx_expiration_window bigint,
    configuration_max_transaction_delay bigint,
    configuration_max_inline_action_size bigint,
    configuration_max_inline_action_depth integer,
    configuration_max_authority_depth integer
);


ALTER TABLE "${schema^}".global_property OWNER TO "docker";

--
-- Name: permission; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".permission (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    owner character varying(13) NOT NULL,
    name character varying(13) NOT NULL,
    parent character varying(13),
    last_updated timestamp without time zone,
    auth_threshold bigint,
    auth_keys "${schema^}".key_weight[],
    auth_accounts "${schema^}".permission_level_weight[],
    auth_waits "${schema^}".wait_weight[]
);


ALTER TABLE "${schema^}".permission OWNER TO "docker";

--
-- Name: permission_link; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".permission_link (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    account character varying(13) NOT NULL,
    code character varying(13) NOT NULL,
    message_type character varying(13) NOT NULL,
    required_permission character varying(13)
);


ALTER TABLE "${schema^}".permission_link OWNER TO "docker";

--
-- Name: protocol_state; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".protocol_state (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    activated_protocol_features "${schema^}".activated_protocol_feature_v0[]
);


ALTER TABLE "${schema^}".protocol_state OWNER TO "docker";

--
-- Name: received_block; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".received_block (
    block_num bigint NOT NULL,
    block_id character varying(64)
);


ALTER TABLE "${schema^}".received_block OWNER TO "docker";

--
-- Name: resource_limits; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".resource_limits (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    owner character varying(13) NOT NULL,
    net_weight bigint,
    cpu_weight bigint,
    ram_bytes bigint
);


ALTER TABLE "${schema^}".resource_limits OWNER TO "docker";

--
-- Name: resource_limits_config; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".resource_limits_config (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    cpu_limit_parameters_target numeric,
    cpu_limit_parameters_max numeric,
    cpu_limit_parameters_periods bigint,
    cpu_limit_parameters_max_multiplier bigint,
    cpu_limit_parameters_contract_rate_numerator numeric,
    cpu_limit_parameters_contract_rate_denominator numeric,
    cpu_limit_parameters_expand_rate_numerator numeric,
    cpu_limit_parameters_expand_rate_denominator numeric,
    net_limit_parameters_target numeric,
    net_limit_parameters_max numeric,
    net_limit_parameters_periods bigint,
    net_limit_parameters_max_multiplier bigint,
    net_limit_parameters_contract_rate_numerator numeric,
    net_limit_parameters_contract_rate_denominator numeric,
    net_limit_parameters_expand_rate_numerator numeric,
    net_limit_parameters_expand_rate_denominator numeric,
    account_cpu_usage_average_window bigint,
    account_net_usage_average_window bigint
);


ALTER TABLE "${schema^}".resource_limits_config OWNER TO "docker";

--
-- Name: resource_limits_state; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".resource_limits_state (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    average_block_net_usage_last_ordinal bigint,
    average_block_net_usage_value_ex numeric,
    average_block_net_usage_consumed numeric,
    average_block_cpu_usage_last_ordinal bigint,
    average_block_cpu_usage_value_ex numeric,
    average_block_cpu_usage_consumed numeric,
    total_net_weight numeric,
    total_cpu_weight numeric,
    total_ram_bytes numeric,
    virtual_net_limit numeric,
    virtual_cpu_limit numeric
);


ALTER TABLE "${schema^}".resource_limits_state OWNER TO "docker";

--
-- Name: resource_usage; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".resource_usage (
    block_num bigint NOT NULL,
    present boolean NOT NULL,
    owner character varying(13) NOT NULL,
    net_usage_last_ordinal bigint,
    net_usage_value_ex numeric,
    net_usage_consumed numeric,
    cpu_usage_last_ordinal bigint,
    cpu_usage_value_ex numeric,
    cpu_usage_consumed numeric,
    ram_usage numeric
);


ALTER TABLE "${schema^}".resource_usage OWNER TO "docker";

--
-- Name: transaction_trace; Type: TABLE; Schema: "${schema^}"; Owner: docker
--

CREATE TABLE "${schema^}".transaction_trace (
    block_num bigint NOT NULL,
    transaction_ordinal integer NOT NULL,
    failed_dtrx_trace character varying(64),
    id character varying(64),
    status "${schema^}".transaction_status_type,
    cpu_usage_us bigint,
    net_usage_words bigint,
    elapsed bigint,
    net_usage numeric,
    scheduled boolean,
    account_ram_delta_present boolean,
    account_ram_delta_account character varying(13),
    account_ram_delta_delta bigint,
    "except" character varying,
    error_code numeric,
    partial_present boolean,
    partial_expiration timestamp without time zone,
    partial_ref_block_num integer,
    partial_ref_block_prefix bigint,
    partial_max_net_usage_words bigint,
    partial_max_cpu_usage_ms smallint,
    partial_delay_sec bigint,
    partial_signatures character varying[],
    partial_context_free_data bytea[]
);


ALTER TABLE "${schema^}".transaction_trace OWNER TO "docker";

--
-- Name: account_metadata account_metadata_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".account_metadata
    ADD CONSTRAINT account_metadata_pkey PRIMARY KEY (block_num, present, name);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".account
    ADD CONSTRAINT account_pkey PRIMARY KEY (block_num, present, name);


--
-- Name: action_trace_auth_sequence action_trace_auth_sequence_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".action_trace_auth_sequence
    ADD CONSTRAINT action_trace_auth_sequence_pkey PRIMARY KEY (block_num, transaction_id, action_ordinal, ordinal);


--
-- Name: action_trace_authorization action_trace_authorization_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".action_trace_authorization
    ADD CONSTRAINT action_trace_authorization_pkey PRIMARY KEY (block_num, transaction_id, action_ordinal, ordinal);


--
-- Name: action_trace action_trace_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".action_trace
    ADD CONSTRAINT action_trace_pkey PRIMARY KEY (block_num, transaction_id, action_ordinal);


--
-- Name: action_trace_ram_delta action_trace_ram_delta_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".action_trace_ram_delta
    ADD CONSTRAINT action_trace_ram_delta_pkey PRIMARY KEY (block_num, transaction_id, action_ordinal, ordinal);


--
-- Name: b1_account b1_account_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_account
    ADD CONSTRAINT b1_account_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_accounts b1_accounts_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_accounts
    ADD CONSTRAINT b1_accounts_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_accountstat b1_accountstat_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_accountstat
    ADD CONSTRAINT b1_accountstat_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_activelikes b1_activelikes_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_activelikes
    ADD CONSTRAINT b1_activelikes_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_categories b1_categories_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_categories
    ADD CONSTRAINT b1_categories_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_moderators b1_moderators_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_moderators
    ADD CONSTRAINT b1_moderators_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_mtndellike b1_mtndellike_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_mtndellike
    ADD CONSTRAINT b1_mtndellike_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_mtndellikes b1_mtndellikes_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_mtndellikes
    ADD CONSTRAINT b1_mtndellikes_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_rewardstat b1_rewardstat_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_rewardstat
    ADD CONSTRAINT b1_rewardstat_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_rptdecisions b1_rptdecisions_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_rptdecisions
    ADD CONSTRAINT b1_rptdecisions_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_rptreasons b1_rptreasons_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_rptreasons
    ADD CONSTRAINT b1_rptreasons_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_tokenstat b1_tokenstat_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_tokenstat
    ADD CONSTRAINT b1_tokenstat_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_topvoices b1_topvoices_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_topvoices
    ADD CONSTRAINT b1_topvoices_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: b1_userlikes b1_userlikes_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".b1_userlikes
    ADD CONSTRAINT b1_userlikes_pkey PRIMARY KEY (block_num, present, primary_key);


--
-- Name: block_info block_info_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".block_info
    ADD CONSTRAINT block_info_pkey PRIMARY KEY (block_num);


--
-- Name: code code_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".code
    ADD CONSTRAINT code_pkey PRIMARY KEY (block_num, present, vm_type, vm_version, code_hash);


--
-- Name: contract_index128 contract_index128_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_index128
    ADD CONSTRAINT contract_index128_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_index256 contract_index256_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_index256
    ADD CONSTRAINT contract_index256_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_index64 contract_index64_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_index64
    ADD CONSTRAINT contract_index64_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_index_double contract_index_double_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_index_double
    ADD CONSTRAINT contract_index_double_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_index_long_double contract_index_long_double_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_index_long_double
    ADD CONSTRAINT contract_index_long_double_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_row contract_row_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_row
    ADD CONSTRAINT contract_row_pkey PRIMARY KEY (block_num, present, code, scope, "table", primary_key);


--
-- Name: contract_table contract_table_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".contract_table
    ADD CONSTRAINT contract_table_pkey PRIMARY KEY (block_num, present, code, scope, "table");


--
-- Name: generated_transaction generated_transaction_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".generated_transaction
    ADD CONSTRAINT generated_transaction_pkey PRIMARY KEY (block_num, present, sender, sender_id);


--
-- Name: global_property global_property_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".global_property
    ADD CONSTRAINT global_property_pkey PRIMARY KEY (block_num, present);


--
-- Name: permission_link permission_link_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".permission_link
    ADD CONSTRAINT permission_link_pkey PRIMARY KEY (block_num, present, account, code, message_type);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (block_num, present, owner, name);


--
-- Name: protocol_state protocol_state_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".protocol_state
    ADD CONSTRAINT protocol_state_pkey PRIMARY KEY (block_num, present);


--
-- Name: received_block received_block_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".received_block
    ADD CONSTRAINT received_block_pkey PRIMARY KEY (block_num);


--
-- Name: resource_limits_config resource_limits_config_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".resource_limits_config
    ADD CONSTRAINT resource_limits_config_pkey PRIMARY KEY (block_num, present);


--
-- Name: resource_limits resource_limits_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".resource_limits
    ADD CONSTRAINT resource_limits_pkey PRIMARY KEY (block_num, present, owner);


--
-- Name: resource_limits_state resource_limits_state_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".resource_limits_state
    ADD CONSTRAINT resource_limits_state_pkey PRIMARY KEY (block_num, present);


--
-- Name: resource_usage resource_usage_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".resource_usage
    ADD CONSTRAINT resource_usage_pkey PRIMARY KEY (block_num, present, owner);


--
-- Name: transaction_trace transaction_trace_pkey; Type: CONSTRAINT; Schema: "${schema^}"; Owner: docker
--

ALTER TABLE ONLY "${schema^}".transaction_trace
    ADD CONSTRAINT transaction_trace_pkey PRIMARY KEY (block_num, transaction_ordinal);


--
-- Name: fill_status_bool_idx; Type: INDEX; Schema: "${schema^}"; Owner: docker
--

CREATE UNIQUE INDEX fill_status_bool_idx ON "${schema^}".fill_status USING btree ((true));


--
-- PostgreSQL database dump complete
--
