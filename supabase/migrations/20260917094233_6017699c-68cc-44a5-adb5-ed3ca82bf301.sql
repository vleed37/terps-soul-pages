-- Public settings must actually reach the public site. app_config holds only
-- owner-supplied public values (business/legal/shipping/imagery); real secrets
-- live in app_secrets, which stays fully locked.
CREATE POLICY "app_config_public_read"
ON public.app_config
FOR SELECT
TO anon, authenticated
USING (true);