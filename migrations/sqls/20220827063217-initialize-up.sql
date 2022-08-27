/* Replace with your SQL commands */

-- Table: public.Users

-- DROP TABLE IF EXISTS public."Users";

CREATE TABLE IF NOT EXISTS public."_tblTestUser"
(
    id bigint,
    firstname character varying COLLATE pg_catalog."default",
    lastname character varying COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."_tblTestUser"
    OWNER to postgres;