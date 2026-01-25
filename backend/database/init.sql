CREATE TABLE users (
  userid VARCHAR(64) PRIMARY KEY,
  password_hash VARCHAR(64) NOT NULL,
  role VARCHAR(16) NOT NULL -- admin | recruiter | student
);

CREATE TABLE public.profile (
  profile_code   SERIAL PRIMARY KEY,
  recruiter_email VARCHAR(128) NOT NULL,
  company_name    VARCHAR(255) NOT NULL,
  designation     VARCHAR(255),
  FOREIGN KEY (recruiter_email) REFERENCES public.users(userid) ON DELETE CASCADE
);

CREATE TABLE public.application (
  profile_code   INTEGER NOT NULL,
  entry_number VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Applied',
  PRIMARY KEY (profile_code, entry_number),
  FOREIGN KEY (profile_code) REFERENCES public.profile(profile_code) ON DELETE CASCADE,
  FOREIGN KEY (entry_number) REFERENCES public.users(userid) ON DELETE CASCADE
);
