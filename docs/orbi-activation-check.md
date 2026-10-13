# Orbi activation check — 13 October 2026

The owner supplied the OpenAI key through a one-time loopback form. It is stored only in ignored `.env.local`. Local OpenAI chat is active on port 4174 using GPT-6 Luna; production activation remains disabled. The existing Aria Grok routine credentials are configured privately. Following explicit authorisation, the real reviewed handoff was enabled locally and tested once. The owner confirmed receiving the notification.

The key-entry form initially rejected Chromium's native form POST because `Referrer-Policy: no-referrer` produced `Origin: null`. Changed the policy to `same-origin` while retaining the exact origin check, CSRF token, loopback-only binding and one-time save. A dummy-key browser test confirmed saving and preservation of the other configuration fields before the owner retried. The entry server stopped after successful submission.

Live checks completed: fleet/service explanation and indoor tank selection (5.4 seconds); an RTK/one-centimetre accuracy follow-up (3.3 seconds); Arabic inspection scoping (4.1 seconds). Replaying the first request returned the saved answer and did not add a duplicate turn. Status retained all six messages. A separate website-widget conversation returned a real inspection answer with approved service/source links. These sample timings are observations, not a service-level guarantee. No test sent a Grok enquiry.

This follow-up fixed three visitor-flow problems before activation:

- After a lost enquiry response, reopening the contact form now retains the original reviewed details and request ID. Checking its receipt cannot silently create a second enquiry.
- Reconnecting clears a stale contact form and restores only the server's receipt.
- An expired session during contact submission exposes the same working reconnect action as chat. Reset also uses this shared recovery state.

Verification: all 64 Node tests passed; the Vite production build passed with the real key present in private configuration; the public-file scan checked 278 files against the actual configured secrets and found no exposed configuration or credentials. The build retains its existing Three.js chunk-size warning. Local callback activation is independently gated and covered by tests.

Browser regression fixture: run Vite development, open `/tests/orbi-contact-fixture.html`, then choose **Run recovery checks**. All three cases were reproduced failing before the fixes and passed afterward. The fixture uses simulated transport responses, has no external side effects, and is not included in the production build.

Live handoff: submitted the exact reviewed test through the website widget with explicit checkbox confirmation. It used the name “Orbit integration test”, the non-customer address `orbi-test@example.com`, and a reason clearly saying TEST ONLY/no callback. The real routine returned acceptance, displayed as reference `2878c016c1f4`. Reloading the website restored the same receipt without submitting another enquiry. The owner then answered “Yes, I received it.” This verifies the widget → local backend → shared Grok routine → owner notification path. `ORBI_LOCAL_CALLBACKS_ENABLED=true` remains set for the functioning local preview.

Remaining deployment work is separate: establish the Orbit GitHub/Netlify targets, production credentials/database and domain cutover. See `NETLIFY-SETUP.md`. No public deployment or DNS change was made.
