-- ============ ENUMS ============
CREATE TYPE public.opportunity_type AS ENUM ('internship','hackathon','event','job','scholarship','project','other');
CREATE TYPE public.connection_status AS ENUM ('pending','accepted','declined');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  age INT CHECK (age IS NULL OR (age >= 12 AND age <= 100)),
  location TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============ OPPORTUNITIES ============
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT,
  type public.opportunity_type NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  location TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX idx_opportunities_type ON public.opportunities(type);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);

CREATE POLICY "Opportunities are viewable by authenticated users"
  ON public.opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create opportunities"
  ON public.opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own opportunities"
  ON public.opportunities FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ============ COMMENTS ============
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_comments_opportunity ON public.comments(opportunity_id, created_at DESC);

CREATE POLICY "Comments viewable by authenticated users"
  ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own comments"
  ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ SAVED OPPORTUNITIES (likes / bookmarks) ============
CREATE TABLE public.saved_opportunities (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves"
  ON public.saved_opportunities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save for self"
  ON public.saved_opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave own"
  ON public.saved_opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ CONNECTIONS ============
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id),
  UNIQUE (requester_id, addressee_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_connections_addressee ON public.connections(addressee_id);

CREATE POLICY "Connections visible to participants"
  ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can request connections"
  ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update connection"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Participants can delete connection"
  ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============ CONVERSATIONS + MESSAGES ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_conversations_users ON public.conversations(user_a, user_b);

-- Security definer helper to avoid RLS recursion when checking participation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv UUID, _user UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conv AND (user_a = _user OR user_b = _user)
  )
$$;

CREATE POLICY "Participants can view conversation"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can create conversations they belong to"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );
CREATE POLICY "Senders can delete own messages"
  ON public.messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ============ TRIGGERS ============
-- Touch updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_opportunities_updated BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_connections_updated BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Bump conversation last_message_at on new message
CREATE OR REPLACE FUNCTION public.bump_conversation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_messages_bump_conv AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();