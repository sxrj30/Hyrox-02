-- Creating comprehensive database schema for AI Financial Coach platform

-- Users profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  phone TEXT,
  occupation TEXT,
  annual_income DECIMAL(12,2),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  financial_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial accounts (bank accounts, investment accounts, etc.)
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment', 'retirement', 'credit_card', 'loan')),
  institution_name TEXT,
  current_balance DECIMAL(12,2) DEFAULT 0,
  interest_rate DECIMAL(5,4),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment portfolio
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  shares DECIMAL(12,6) NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2),
  purchase_date DATE NOT NULL,
  investment_type TEXT CHECK (investment_type IN ('stock', 'bond', 'etf', 'mutual_fund', 'crypto', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial goals
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI chat conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for financial_accounts
CREATE POLICY "Users can view their own accounts" ON public.financial_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.financial_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.financial_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.financial_accounts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for investments
CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for financial_goals
CREATE POLICY "Users can view their own goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages (users can access messages from their conversations)
CREATE POLICY "Users can view messages from their conversations" ON public.chat_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert messages to their conversations" ON public.chat_messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
