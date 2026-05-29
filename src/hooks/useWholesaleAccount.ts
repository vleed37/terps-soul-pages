import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyWholesaleAccount } from "@/lib/wholesale.functions";

export function useWholesaleAccount() {
  const getAccount = useServerFn(getMyWholesaleAccount);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const q = useQuery({
    queryKey: ["wholesale-account-me"],
    queryFn: () => getAccount(),
    enabled: hasSession === true,
    retry: false,
    staleTime: 60_000,
  });

  return {
    account: q.data ?? null,
    isLoading: hasSession === null || (hasSession === true && q.isLoading),
    error: q.error,
  };
}