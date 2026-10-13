export function safeLink(value) {
  if (typeof value !== 'string' || !value || /[\\\u0000-\u0020]/.test(value) || /%(?:5c|0[ad])/i.test(value)) return null;
  if (!value.startsWith('/') && !value.startsWith('#')) return null;
  if (value.startsWith('//')) return null;
  try {
    const url = new URL(value, 'https://orbi.invalid');
    if (url.origin !== 'https://orbi.invalid') return null;
    return value.startsWith('#') ? url.hash : url.pathname + url.search + url.hash;
  } catch { return null; }
}
export function normalizeAnswer(value) {
  if (!value || typeof value.reply !== 'string' || !value.reply.trim()) throw new Error('Orbi could not read that reply. Please try again.');
  const links = (Array.isArray(value.links) ? value.links : []).slice(0, 5).flatMap(item => {
    const href = safeLink(item?.href);
    return href && typeof item.label === 'string' && item.label.trim() ? [{ label: item.label.slice(0, 100), href }] : [];
  });
  return { reply: value.reply.trim().slice(0, 12000), links };
}
export function guideReply(message, routes = {}) {
  const link = (label, route, fallback) => ({ label, href: safeLink(routes[route]) || fallback });
  const contact = link('Plan a capture', 'contact', '/contact/');
  const text = String(message).toLowerCase();
  if (/\b(price|pricing|cost|quote|budget|contact|email|call|book|schedule)\b/.test(text)) {
    return {reply: "The team can help scope your capture and prepare a quote. Share the site location, the type of capture you need, and your preferred timing on the contact page.", links:[contact]};
  }
  if (/\b(360|walkthrough|walkthroughs|interior|virtual tour)\b/.test(text)) {
    return {reply: '360° walkthroughs let people explore a space remotely and revisit visual records. They can be useful for interiors and project reviews.', links:[link('Explore 360° walkthroughs','walkthroughs','/services/360-walkthroughs/'),contact]};
  }
  if (/\b(map|mapping|survey|surveying|3d|spatial|photogrammetry|point cloud)\b/.test(text)) {
    return {reply: 'Spatial mapping connects aerial capture with a navigable view of your site. Explore mapping to see how it supports understanding site layout and context. The team can confirm the deliverables your project needs.', links:[link('Explore spatial mapping','mapping','/services/spatial-mapping/'),contact]};
  }
  if (/\b(time[ -]?lapse|timelapse)\b/.test(text)) {
    return {reply: 'Time-lapse records change over an extended period and brings those moments together in a concise visual sequence. The team can help plan a suitable capture schedule.', links:[link('Explore time-lapse','timelapse','/services/time-lapse/'),contact]};
  }
  if (/\b(handover|finished|completion)\b/.test(text)) {
    return {reply: 'Handover media presents the completed project through a considered set of visual deliverables. Share who the material is for and the team can help select the right approach.', links:[link('Explore handover media','handover','/services/handover-media/'),contact]};
  }
  if (/\b(progress|documentation|construction|monitor|monitoring)\b/.test(text)) {
    return {reply: 'Progress documentation creates a consistent visual record as your project changes. It helps people revisit stages and share a clearer view of the site.', links:[link('Explore progress documentation','progress','/services/progress-documentation/'),contact]};
  }
  if (/\b(hello|hi|hey|help|services|start|guide|capture|orbi)\b/.test(text)) {
    return {reply: "I'm Orbi, your Orbit guide. I can point you toward progress documentation, spatial mapping, 360° walkthroughs, time-lapse, or handover media. What would you like to capture?", links:[link('View all services','services','/services/'),contact]};
  }
  return {reply: "I can help you find Orbit's services and the right place to start. For project-specific details, equipment, availability, or a question outside this guide, the team can help through the contact page.", links:[link('View all services','services','/services/'),contact]};
}
