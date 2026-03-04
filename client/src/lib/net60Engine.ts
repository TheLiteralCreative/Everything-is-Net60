// ============================================================
// NET-60 GENERATOR ENGINE
// Deterministic implementation of the NET-60 Generator System Prompt
// No LLM required — rule-based assembly from token library
// Two-prompt output: Prompt 1 (Scene, no CTA) + Prompt 2 (CTA Cutaway)
// ============================================================

export type Mode = "POC_SINGLE" | "POC_DOUBLE" | "EPISODIC";
export type Domain =
  | "Food"
  | "Health"
  | "Utilities"
  | "Transit"
  | "Retail"
  | "Finance"
  | "Education"
  | "Infrastructure"
  | "Emergency"
  | "Tech"
  | "Logistics"
  | "Entertainment"
  | "Care"
  | "Service"
  | "Ceremony";
export type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";
export type VisualStyle = string;
export type CTAFocus = string;
export type ToneIntensity = string;

export interface NET60Token {
  scenario_id: string;
  domain: Domain;
  setting_visual: string;
  role_authority: string;
  urgent_expectation: string;
  net60_line: string;
  visual_contrast_beat: string;
  delores_variant?: string;
  cta_line: string;
  urgency_level: UrgencyLevel;
  cutaway_subject: string;   // Artistically framed object for Prompt 2 CTA shot
  cutaway_framing: string;   // Specific framing/composition note for the cutaway
}

export interface EpisodeParams {
  mode: Mode;
  domain: Domain;
  delorification: boolean;
  urgency_level: UrgencyLevel;
  visual_style: VisualStyle;
  setting_constraints: string;
  cta_focus: CTAFocus;
  tone_intensity: ToneIntensity;
  additional_notes?: string;
  max_runtime_mode?: boolean;
  client_subject_name?: string;    // Name of featured client/subject for CTA voiceover
  scenario_id_override?: string;   // Direct scenario selection by ID
  blur_intensity?: BlurIntensity;  // Gaussian blur intensity for Prompt 2 background plate
}

export interface BatchParams {
  structure_mode: "POC_SINGLE" | "POC_DOUBLE";
  delorification_ratio: number; // 0–10 (out of 10 episodes)
  urgency_distribution: { low: number; moderate: number; high: number; critical: number };
  domains: Domain[];
  visual_style_consistency: VisualStyle | "Mixed but restrained";
  cta_focus: CTAFocus | "Mixed";
  tone_baseline: ToneIntensity;
  experimental_slot: boolean;
  max_runtime_mode: boolean;
  client_subject_name?: string;
}

export interface GeneratedEpisode {
  scenario_id: string;
  mode: Mode;
  domain: Domain;
  spot_breakdown: {
    S: string; // Situation
    P: string; // Procedural Delay
    O: string; // Observable Consequence
    T: string; // Takeaway (CTA)
  };
  shot_structure: Shot[];
  veo_prompt_1: string;       // Scene prompt — no CTA, pure satirical beat
  veo_prompt_2: string;       // CTA cutaway — artistically framed object + tagline + client name
  veo_one_shot_prompt: string; // Alias for veo_prompt_1 (backward compat)
  cta: string;
  delorified: boolean;
  client_subject_name?: string;
  token: NET60Token;           // Expose token for UI display
}

export interface Shot {
  number: number;
  time_range: string;
  setting: string;
  authority?: string;
  dialogue?: string;
  ambient: string;
  visual_end_beat: string;
}

// ============================================================
// FULL TOKEN LIBRARY — All 30 NET60 Scenarios
// ============================================================

export const NET60_TOKENS: NET60Token[] = [
  // CORE 15
  {
    scenario_id: "NET60_COFFEE",
    domain: "Food",
    setting_visual: "Bright neighborhood coffee shop, espresso machine hissing, morning light through windows.",
    role_authority: "Barista",
    urgent_expectation: "Customer receives their latte immediately after ordering.",
    net60_line: "Your latte will be ready in 60 business days.",
    visual_contrast_beat: "Customer stares at empty counter. Receipt in hand. Espresso machine hisses in background.",
    delores_variant: "Accounts Payable. This is Delores speaking. Your beverage request is currently under review.",
    cta_line: "Your revenue shouldn't take longer than your coffee. Access your cash now.",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of a quiet neighborhood coffee shop in the early morning — empty stools at the counter, steam rising faintly from an espresso machine, warm window light washing across the room.",
    cutaway_framing: "Wide establishing shot, locked tripod. Soft gaussian blur applied to the entire frame — scene is felt, not read. Warm morning light. No centered subject. Ambient movement: faint steam drift, distant light shift. Upper two-thirds of frame clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_GAS",
    domain: "Utilities",
    setting_visual: "Gas station forecourt, midday sun, single car at pump.",
    role_authority: "Pump Speaker",
    urgent_expectation: "Driver fills tank immediately.",
    net60_line: "Fuel dispensing pending approval.",
    visual_contrast_beat: "Gas gauge resting on E. Driver staring at the pump screen.",
    delores_variant: "Accounts Payable. This is Delores. Fuel release is pending reconciliation.",
    cta_line: "If fuel can't wait, neither should your cash.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide shot of an empty gas station forecourt under midday sun — pumps idle, heat shimmer rising off the concrete, a single car barely visible at the far edge of frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur softening the entire scene. Harsh midday light creating a flat, bleached atmosphere. No centered subject. Ambient movement: heat shimmer, distant flag or banner drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_AMBULANCE",
    domain: "Emergency",
    setting_visual: "Roadside emergency scene. Ambulance parked. Overcast sky.",
    role_authority: "Paramedic",
    urgent_expectation: "Patient receives immediate emergency care.",
    net60_line: "Your emergency is currently in queue.",
    visual_contrast_beat: "Sirens off. Patient on stretcher, staring at the sky. Paramedic holding clipboard.",
    delores_variant: "Accounts Payable. This is Delores. Your emergency response is pending billing confirmation.",
    cta_line: "Critical needs don't operate on Net-60.",
    urgency_level: "Critical",
    cutaway_subject: "Wide shot of an empty roadside emergency scene — ambulance parked at the shoulder, overcast sky, asphalt stretching into the distance, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cold, flat, overcast atmosphere. No centered subject. Ambient movement: distant light flicker from emergency lights, slight wind movement. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_RESTAURANT",
    domain: "Food",
    setting_visual: "Upscale restaurant interior. Candlelit table. Family seated.",
    role_authority: "Waiter",
    urgent_expectation: "Family receives their food after ordering.",
    net60_line: "We'll begin preparing your order in 45 to 60 business days.",
    visual_contrast_beat: "Family at empty table. Menus still open. Ambient restaurant noise continues.",
    delores_variant: "Accounts Payable. This is Delores. Your order has been received and is pending approval.",
    cta_line: "Hungry for growth? Stop waiting to get paid.",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of a candlelit restaurant dining room — empty tables set for service, warm amber light, soft bokeh of candle flames in the background, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — warm, intimate atmosphere. No centered subject. Ambient movement: faint candle flicker, distant light shift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_PAYROLL",
    domain: "Finance",
    setting_visual: "Corporate HR office. Fluorescent lighting. Employee standing at desk.",
    role_authority: "HR Rep",
    urgent_expectation: "Employee receives their paycheck on payday.",
    net60_line: "Direct deposit is pending review.",
    visual_contrast_beat: "Employee refreshing banking app. Balance unchanged. Quiet office hum.",
    delores_variant: "Accounts Payable. This is Delores. Your compensation disbursement is under review.",
    cta_line: "Your team shows up on time. Your cash should too.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of a corporate office floor — rows of empty desks under fluorescent light, monitors dark, chairs tucked in, end of day stillness.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cool, flat fluorescent atmosphere. No centered subject. Ambient movement: distant HVAC flicker, faint light hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_CONSTRUCTION",
    domain: "Infrastructure",
    setting_visual: "Active construction site. Foundation poured. Crew standing idle.",
    role_authority: "Foreman",
    urgent_expectation: "Crew begins concrete pour on schedule.",
    net60_line: "Concrete pour pending final approval.",
    visual_contrast_beat: "Crew idle over foundation. Hard hats. Silence. Equipment unmoved.",
    delores_variant: "Accounts Payable. This is Delores. Material deployment is pending reconciliation.",
    cta_line: "Idle time is expensive. So is delayed payment.",
    urgency_level: "High",
    cutaway_subject: "Wide shot of an idle construction site — foundation poured, equipment parked, crew absent, overcast sky above, dust settling across the empty lot.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — flat overcast light, muted earth tones. No centered subject. Ambient movement: dust drift, distant crane or flag movement. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_GROCERY",
    domain: "Retail",
    setting_visual: "Grocery store checkout lane. Fluorescent lights. Single customer at register.",
    role_authority: "Cashier",
    urgent_expectation: "Customer pays and leaves with groceries.",
    net60_line: "Payment will clear in 60 days.",
    visual_contrast_beat: "Customer holding grocery bags mid-transaction. Cashier waiting. Lane backed up.",
    delores_variant: "Accounts Payable. This is Delores. Your transaction is in processing.",
    cta_line: "Exactly.",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of an empty grocery store checkout area — lanes idle, fluorescent light humming overhead, conveyor belts still, no customers in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cool fluorescent atmosphere, flat and institutional. No centered subject. Ambient movement: distant conveyor belt light flicker, faint overhead hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_AIRPORT",
    domain: "Transit",
    setting_visual: "Airport gate. Jetway door open. Passengers in line.",
    role_authority: "Gate Agent",
    urgent_expectation: "Passengers board the plane.",
    net60_line: "Boarding will begin in 90 business days.",
    visual_contrast_beat: "Passengers frozen mid-jetway. Carry-ons in hand. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Boarding is pending final clearance.",
    cta_line: "Momentum dies when payment lags.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of an airport gate area — rows of empty seats, jetway door visible in the background, terminal light washing across the space, no passengers in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cool terminal light, institutional atmosphere. No centered subject. Ambient movement: distant gate light flicker, faint PA system hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_FIRE",
    domain: "Emergency",
    setting_visual: "Residential street. House with smoke rising. Fire truck parked.",
    role_authority: "Firefighter",
    urgent_expectation: "Firefighters immediately deploy water.",
    net60_line: "Water activation pending approval.",
    visual_contrast_beat: "House smoldering. Hose coiled. Firefighter standing with clipboard.",
    delores_variant: "Accounts Payable. This is Delores. Water deployment is pending budget authorization.",
    cta_line: "Some things can't wait for paperwork.",
    urgency_level: "Critical",
    cutaway_subject: "Wide shot of a residential street with a fire truck parked at the curb — house visible in the background, overcast sky, no figures in frame, smoke faintly drifting at the far edge.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — flat overcast light, muted and cold. No centered subject. Ambient movement: faint smoke drift at frame edge, distant light flicker. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_DOCTOR",
    domain: "Health",
    setting_visual: "Medical exam room. Sterile white walls. Patient on exam table.",
    role_authority: "Nurse",
    urgent_expectation: "Patient receives treatment immediately.",
    net60_line: "Treatment begins once billing clears.",
    visual_contrast_beat: "Patient on exam table. Nurse with clipboard. Medical equipment idle.",
    delores_variant: "Accounts Payable. This is Delores. Your treatment authorization is under review.",
    cta_line: "Operational delays don't belong in life-or-death decisions.",
    urgency_level: "Critical",
    cutaway_subject: "Wide interior of a sterile medical exam room — exam table empty, equipment idle against the walls, overhead fluorescent light, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — sterile white and cool blue atmosphere. No centered subject. Ambient movement: faint fluorescent flicker, distant HVAC hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_POWER",
    domain: "Utilities",
    setting_visual: "Home interior. Evening. Single lamp on table.",
    role_authority: "Utility Text",
    urgent_expectation: "Lights stay on.",
    net60_line: "Power release pending reconciliation.",
    visual_contrast_beat: "Hand on light switch. Darkness. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Your power restoration is pending account review.",
    cta_line: "If power shuts off when cash slows down, fix the cash.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of a home living room at dusk — lamps off, furniture in silhouette, faint window light the only source, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — dim, warm-to-cool dusk atmosphere. No centered subject. Ambient movement: faint window light shift, distant curtain drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_WEDDING",
    domain: "Ceremony",
    setting_visual: "Wedding ceremony. Outdoor venue. Guests seated. Bride and groom at altar.",
    role_authority: "Officiant",
    urgent_expectation: "Ceremony proceeds on schedule.",
    net60_line: "We'll proceed once payment confirmation arrives.",
    visual_contrast_beat: "Bride and groom frozen at altar. Guests waiting. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Ceremony commencement is pending final authorization.",
    cta_line: "Life moves forward. Net-60 holds it back.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide shot of an outdoor wedding venue — rows of empty chairs, floral arrangements visible, natural light filtering through trees, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — soft natural outdoor light, warm and diffused. No centered subject. Ambient movement: gentle leaf movement, distant fabric drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_SOFTWARE",
    domain: "Tech",
    setting_visual: "Office desk. Monitor showing login screen. Clean minimal workspace.",
    role_authority: "Login Screen",
    urgent_expectation: "User accesses their software dashboard immediately.",
    net60_line: "Access granted in 60 business days.",
    visual_contrast_beat: "Locked dashboard. Cursor blinking. Hands on keyboard. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Your access request is pending approval.",
    cta_line: "Access your own revenue instantly.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of a minimal office workspace — clean desk, dark monitor, soft desk lamp the only light source, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — dark, minimal atmosphere with single warm light source. No centered subject. Ambient movement: faint monitor standby light pulse, distant HVAC hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_DELIVERY",
    domain: "Logistics",
    setting_visual: "Loading dock. Delivery truck idling. Driver standing outside.",
    role_authority: "Driver",
    urgent_expectation: "Driver unloads cargo immediately upon arrival.",
    net60_line: "Unloading once fuel approval clears.",
    visual_contrast_beat: "Idling truck. Driver leaning against cab. Dock empty.",
    delores_variant: "Accounts Payable. This is Delores. Unloading authorization is pending.",
    cta_line: "Work completed. Payment shouldn't be theoretical.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide shot of an empty loading dock — bay doors open, dock plate down, overcast sky visible beyond the opening, no figures or vehicles in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — flat overcast industrial light. No centered subject. Ambient movement: distant wind through open bay, faint dust drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_GYM",
    domain: "Health",
    setting_visual: "Modern gym floor. Natural lighting. Client holding dumbbells mid-rep.",
    role_authority: "Trainer",
    urgent_expectation: "Trainer begins the workout session immediately.",
    net60_line: "We'll start your workout in two billing cycles.",
    visual_contrast_beat: "Client holding dumbbells awkwardly at sides. Trainer with clipboard. Ambient gym noise.",
    delores_variant: "Accounts Payable. This is Delores. Your session commencement is pending billing confirmation.",
    cta_line: "Growth doesn't wait. Why should you?",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of a modern gym floor — equipment racks visible, natural light from high windows, rubber flooring stretching across the frame, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cool gym light, natural and fluorescent mix. No centered subject. Ambient movement: faint dust motes in light shafts, distant equipment reflection. Upper two-thirds clear for post-production graphic overlay.",
  },
  // EXTENDED 15
  {
    scenario_id: "NET60_DENTIST",
    domain: "Health",
    setting_visual: "Dental office. Bright overhead light. Patient reclined in chair.",
    role_authority: "Dentist",
    urgent_expectation: "Dentist begins procedure immediately.",
    net60_line: "Procedure pending billing confirmation.",
    visual_contrast_beat: "Drill hovering. Patient staring at ceiling. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Procedure authorization is under review.",
    cta_line: "Pain doesn't wait. Neither should your payment.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of a dental office — exam chair empty under bright overhead light, equipment arms retracted, sterile white walls, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — bright sterile white atmosphere. No centered subject. Ambient movement: faint overhead light flicker, distant HVAC hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_PHARMACY",
    domain: "Health",
    setting_visual: "Pharmacy counter. Fluorescent lighting. Prescription bag on shelf.",
    role_authority: "Pharmacist",
    urgent_expectation: "Patient picks up prescription immediately.",
    net60_line: "Pickup window opens in 60 days.",
    visual_contrast_beat: "Empty prescription counter. Patient waiting. Bag visible behind glass.",
    delores_variant: "Accounts Payable. This is Delores. Your prescription release is pending authorization.",
    cta_line: "Timing matters. Especially for cash flow.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of a pharmacy — shelves of medication visible in the background, counter empty, fluorescent light overhead, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — cool fluorescent institutional atmosphere. No centered subject. Ambient movement: faint overhead light flicker, distant shelf reflection. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_INTERNET",
    domain: "Utilities",
    setting_visual: "Home office. Desk setup. Video call frozen on monitor.",
    role_authority: "ISP Rep",
    urgent_expectation: "Internet connection is restored immediately.",
    net60_line: "Bandwidth pending approval.",
    visual_contrast_beat: "Frozen video call. Spinning buffer icon. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Your bandwidth restoration is pending reconciliation.",
    cta_line: "When systems stall, revenue stalls.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of a home office at midday — desk setup visible, monitor dark, window light the dominant source, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — natural window light, clean and quiet. No centered subject. Ambient movement: faint window light shift, distant curtain drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_TOW",
    domain: "Transit",
    setting_visual: "Urban street. Car blocking traffic. Tow truck parked behind it.",
    role_authority: "Tow Driver",
    urgent_expectation: "Tow driver removes the blocking vehicle immediately.",
    net60_line: "Vehicle removal once invoice matures.",
    visual_contrast_beat: "Car blocking traffic. Horns in distance. Tow driver leaning on truck.",
    delores_variant: "Accounts Payable. This is Delores. Vehicle removal is pending invoice reconciliation.",
    cta_line: "Delays create bigger problems.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide shot of an urban street intersection — cars backed up, tow truck visible at the far edge, overcast sky above, no figures prominent in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — flat overcast urban atmosphere. No centered subject. Ambient movement: distant traffic light flicker, faint exhaust drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_SCHOOL",
    domain: "Education",
    setting_visual: "Elementary school entrance. Morning. Parent at locked front doors.",
    role_authority: "Teacher",
    urgent_expectation: "Parent drops child off at school.",
    net60_line: "Release pending tuition reconciliation.",
    visual_contrast_beat: "Parent at locked doors. Child beside them. Backpack on.",
    delores_variant: "Accounts Payable. This is Delores. Enrollment access is pending account review.",
    cta_line: "Access shouldn't be conditional.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide shot of an elementary school entrance in the morning — front doors visible, empty sidewalk, warm early light across the building facade, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — warm morning light, soft and diffused. No centered subject. Ambient movement: faint flag movement, distant leaf drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_SERVER",
    domain: "Tech",
    setting_visual: "Server room. Dark monitors. IT technician standing at workstation.",
    role_authority: "IT Tech",
    urgent_expectation: "Server is restarted immediately to restore operations.",
    net60_line: "Server restart pending financial approval.",
    visual_contrast_beat: "Dark monitors. Blinking server lights. IT tech with hands on keyboard.",
    delores_variant: "Accounts Payable. This is Delores. System restoration is pending budget authorization.",
    cta_line: "Downtime costs.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of a dark server room — racks of equipment visible, indicator lights faintly pulsing, no figures in frame, near darkness.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — near-dark environment with only faint indicator light sources. No centered subject. Ambient movement: subtle light pulse rhythm across racks. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_MECHANIC",
    domain: "Service",
    setting_visual: "Auto repair shop. Bay doors open. Car on lift.",
    role_authority: "Mechanic",
    urgent_expectation: "Customer receives their car keys after repair is complete.",
    net60_line: "You can drive once payment cycles.",
    visual_contrast_beat: "Keys in mechanic's hand. Customer waiting. Car visible on lift behind them.",
    delores_variant: "Accounts Payable. This is Delores. Vehicle release is pending payment processing.",
    cta_line: "Completed work deserves completed payment.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of an auto repair shop bay — car on lift, bay doors open to daylight, tools on walls, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — mixed natural and fluorescent shop light. No centered subject. Ambient movement: faint dust motes in light shafts from open bay doors. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_GENERATOR",
    domain: "Infrastructure",
    setting_visual: "Industrial facility. Emergency generator room. Lights flickering.",
    role_authority: "Facility Manager",
    urgent_expectation: "Generator is refueled immediately during power outage.",
    net60_line: "Refuel after reconciliation closes.",
    visual_contrast_beat: "Generator sputtering. Lights dimming. Facility manager with clipboard.",
    delores_variant: "Accounts Payable. This is Delores. Fuel authorization is pending reconciliation.",
    cta_line: "Containment isn't growth.",
    urgency_level: "High",
    cutaway_subject: "Wide interior of an industrial facility generator room — large equipment visible along the walls, emergency lighting dim, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — dim industrial atmosphere, emergency light as primary source. No centered subject. Ambient movement: faint emergency light flicker, distant mechanical hum. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_MOVIE",
    domain: "Entertainment",
    setting_visual: "Movie theater. Dark auditorium. Audience seated. Screen blank.",
    role_authority: "Usher",
    urgent_expectation: "Film begins at scheduled showtime.",
    net60_line: "Film starts once concessions settle.",
    visual_contrast_beat: "Silent theater. Audience waiting. Blank screen. Popcorn in hand.",
    delores_variant: "Accounts Payable. This is Delores. Screening authorization is pending concession reconciliation.",
    cta_line: "Momentum matters.",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of a dark movie theater auditorium — rows of empty seats, blank screen glowing faintly at the far end, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — dark theater atmosphere with faint screen glow as the only light source. No centered subject. Ambient movement: faint screen light pulse, distant seat reflection. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_POLICE",
    domain: "Emergency",
    setting_visual: "Residential street. Police cruiser parked. Officer inside.",
    role_authority: "Dispatcher",
    urgent_expectation: "Officer responds to emergency call immediately.",
    net60_line: "Deployment pending review.",
    visual_contrast_beat: "Officer waiting in cruiser. Radio silent. Street empty.",
    delores_variant: "Accounts Payable. This is Delores. Response deployment is pending authorization.",
    cta_line: "Speed matters.",
    urgency_level: "Critical",
    cutaway_subject: "Wide shot of a residential street at dusk — police cruiser parked at the curb, streetlights beginning to glow, no figures visible, quiet suburban atmosphere.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — dusk atmosphere, warm streetlight beginning to emerge against cooling sky. No centered subject. Ambient movement: faint cruiser light reflection on pavement, distant leaf drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_MOVING",
    domain: "Logistics",
    setting_visual: "Empty house. Moving truck outside. Movers standing at door.",
    role_authority: "Mover",
    urgent_expectation: "Movers unload furniture immediately.",
    net60_line: "Unloading scheduled in 60 days.",
    visual_contrast_beat: "Empty house. Movers standing at door. Boxes still on truck.",
    delores_variant: "Accounts Payable. This is Delores. Unloading authorization is pending invoice review.",
    cta_line: "Progress delayed is progress denied.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of an empty house — bare hardwood floors, blank walls, natural window light the only source, moving boxes visible in the background, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — clean natural window light, quiet and sparse. No centered subject. Ambient movement: faint window light shift, distant curtain drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_DAYCARE",
    domain: "Care",
    setting_visual: "Daycare entrance. Morning drop-off. Parent at front desk.",
    role_authority: "Staff",
    urgent_expectation: "Parent drops child off and proceeds to work.",
    net60_line: "Service resumes after billing clears.",
    visual_contrast_beat: "Parent waiting awkwardly. Child beside them. Staff at desk with clipboard.",
    delores_variant: "Accounts Payable. This is Delores. Care service is pending account reconciliation.",
    cta_line: "Reliability builds trust.",
    urgency_level: "Moderate",
    cutaway_subject: "Wide interior of a daycare facility in the morning — small tables and chairs visible, colorful walls, warm light through windows, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — warm morning light, soft and welcoming. No centered subject. Ambient movement: faint window light shift, distant mobile or decoration drift. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_INVESTOR",
    domain: "Finance",
    setting_visual: "Startup office. Whiteboard with runway chart. Founder at desk.",
    role_authority: "VC",
    urgent_expectation: "Founder receives committed funding on agreed date.",
    net60_line: "Funding wired in 90 days.",
    visual_contrast_beat: "Founder staring at runway chart. Numbers declining. Silence.",
    delores_variant: "Accounts Payable. This is Delores. Fund disbursement is pending final authorization.",
    cta_line: "Runway shrinks while you wait.",
    urgency_level: "Critical",
    cutaway_subject: "Wide interior of a startup office — whiteboards visible on walls, desks with monitors, natural light from large windows, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — natural office light, clean and open. No centered subject. Ambient movement: faint window light shift, distant monitor standby pulse. Upper two-thirds clear for graphic overlay.",
  },
  {
    scenario_id: "NET60_TRAFFIC",
    domain: "Infrastructure",
    setting_visual: "Urban intersection. Cars backed up. Digital traffic sign overhead.",
    role_authority: "Digital Sign",
    urgent_expectation: "Traffic light turns green.",
    net60_line: "Green light pending approval.",
    visual_contrast_beat: "Cars backed up. Engines idling. Sign still red.",
    delores_variant: "Accounts Payable. This is Delores. Signal authorization is pending review.",
    cta_line: "Flow matters.",
    urgency_level: "Low",
    cutaway_subject: "Wide shot of an urban intersection under overcast sky — traffic backed up in multiple lanes, buildings visible in the background, no figures prominent in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — flat overcast urban atmosphere, muted grays. No centered subject. Ambient movement: faint exhaust drift, distant traffic light flicker. Upper two-thirds clear for post-production graphic overlay.",
  },
  {
    scenario_id: "NET60_COFFEE2",
    domain: "Food",
    setting_visual: "Busy coffee shop. Counter crowded. Barista at espresso machine.",
    role_authority: "Barista",
    urgent_expectation: "Customer receives their espresso shot immediately.",
    net60_line: "We're escalating your espresso.",
    visual_contrast_beat: "Empty cup on counter. Customer watching. Machine idle.",
    delores_variant: "Accounts Payable. This is Delores. Your beverage escalation is in process.",
    cta_line: "Some things should be immediate.",
    urgency_level: "Low",
    cutaway_subject: "Wide interior of a busy coffee shop between rushes — counter visible in the background, espresso machine idle, warm light through windows, stools empty, no figures in frame.",
    cutaway_framing: "Wide establishing shot, locked tripod. Gaussian blur applied across the frame — warm café atmosphere, soft and ambient. No centered subject. Ambient movement: faint steam drift from machine, distant light shift through windows. Upper two-thirds clear for post-production graphic overlay.",
  },
];

// ============================================================
// VISUAL STYLE → CAMERA LANGUAGE MAPPING
// ============================================================

const CAMERA_LANGUAGE: Record<string, string> = {
  "Locked tripod": "Static locked frame. No camera movement. Symmetrical composition. Natural lighting.",
  "Subtle handheld": "Slight handheld movement. Documentary realism. Natural lighting. Shallow depth of field.",
  "Symmetrical frame": "Perfectly symmetrical composition. Locked tripod. Centered subject. Balanced negative space.",
  "Close-up realism": "Tight close-up framing. Shallow depth of field. Natural lighting. Minimal movement.",
  "Mixed but restrained": "Restrained camera movement. Mix of locked and subtle handheld. Natural lighting throughout.",
};

// ============================================================
// TONE → DELIVERY LANGUAGE MAPPING
// ============================================================

const TONE_LANGUAGE: Record<string, string> = {
  "Deadpan neutral": "completely flat, emotionless delivery — as if reading from a policy document",
  "Slightly ironic": "calm but with the faintest trace of self-awareness — still procedural, never comedic",
  "Clinical": "precise, medical-grade neutrality — no warmth, no hesitation",
  "Corporate calm": "polished corporate composure — pleasant tone, unreasonable content",
  "Dry seriousness": "grave seriousness applied to an absurd situation — no acknowledgment of irony",
};

// ============================================================
// CTA FOCUS → CTA LANGUAGE MODIFIER
// ============================================================

const CTA_MODIFIERS: Record<string, string> = {
  "Cash flow": "cash flow and receivables",
  "Payroll": "payroll and team compensation",
  "Working capital": "working capital and liquidity",
  "Growth": "growth and expansion capital",
  "Momentum": "operational momentum",
  "Operations": "operational continuity",
  "General AR": "accounts receivable acceleration",
};

// ============================================================
// CORE GENERATION FUNCTION — Single Episode
// ============================================================

export function generateEpisode(params: EpisodeParams, tokenOverride?: NET60Token): GeneratedEpisode {
  // Resolve token: scenario override → domain match → fallback
  let token: NET60Token;
  if (params.scenario_id_override) {
    token = NET60_TOKENS.find((t) => t.scenario_id === params.scenario_id_override) || getTokenByDomain(params.domain, params.urgency_level);
  } else if (tokenOverride) {
    token = tokenOverride;
  } else {
    token = getTokenByDomain(params.domain, params.urgency_level);
  }

  const scenarioId = `${token.scenario_id}_${String(Math.floor(Math.random() * 900) + 100)}`;
  const cameraLang = CAMERA_LANGUAGE[params.visual_style] ?? `${params.visual_style} camera approach. Natural lighting.`;
  const toneLang = TONE_LANGUAGE[params.tone_intensity] ?? `${params.tone_intensity} delivery`;
  const ctaModifier = CTA_MODIFIERS[params.cta_focus] ?? params.cta_focus;
  const clientName = params.client_subject_name?.trim() || null;

  // Build authority line — Delores or contextual
  const authorityLine = params.delorification
    ? (token.delores_variant || `Accounts Payable. This is Delores. ${token.net60_line}`)
    : `${token.role_authority} (${toneLang}): "${token.net60_line}"`;

  // Build SPOT breakdown
  const spot = {
    S: `${token.setting_visual} ${token.role_authority} approaches. ${token.urgent_expectation}`,
    P: params.delorification
      ? `Off-screen AP voice (Delores) delivers delay with procedural calm: "${token.net60_line}"`
      : `${token.role_authority} delivers delay with ${toneLang}: "${token.net60_line}"`,
    O: token.visual_contrast_beat,
    T: token.cta_line,
  };

  // Build shot structure
  const shots: Shot[] = buildShots(params, token, cameraLang, authorityLine);

  // Build Prompt 1 — Scene only, no CTA
  const prompt1 = buildScenePrompt(params, token, cameraLang, authorityLine, toneLang);

  // Build Prompt 2 — CTA Cutaway
  const prompt2 = buildCTACutawayPrompt(token, cameraLang, clientName, params.blur_intensity ?? "medium");

  return {
    scenario_id: scenarioId,
    mode: params.mode,
    domain: params.domain,
    spot_breakdown: spot,
    shot_structure: shots,
    veo_prompt_1: prompt1,
    veo_prompt_2: prompt2,
    veo_one_shot_prompt: prompt1, // backward compat alias
    cta: token.cta_line,
    delorified: params.delorification,
    client_subject_name: clientName || undefined,
    token,
  };
}

// ============================================================
// PROMPT 1 — SCENE PROMPT (no CTA)
// ============================================================

function buildScenePrompt(
  params: EpisodeParams,
  token: NET60Token,
  cameraLang: string,
  authorityLine: string,
  _toneLang: string
): string {
  const settingConstraint = params.setting_constraints && params.setting_constraints !== "None"
    ? `\n${params.setting_constraints}.`
    : "";

  return `[SCENE — Google VEO 3 | 8s | 16:9 | Dialogue | Text-Free]

[SCENE]
${token.setting_visual}${settingConstraint}
${authorityLine}
${token.visual_contrast_beat}

[VISUAL STYLE]
${cameraLang}
No on-screen text. No logos. No titles.

[AUDIO]
Diegetic ambient sound only. No music bed.
Dialogue delivered once. Clean articulation above ambient.
Hold 1.5 seconds. Silence. Hard cut.

[END]
Duration-lock: 8s. Text-free. Maintain documentary realism.`;
}

// ============================================================
// PROMPT 2 — CTA CUTAWAY PROMPT
// ============================================================

function buildCTACutawayPrompt(
  token: NET60Token,
  _cameraLang: string,
  clientName: string | null,
  blurIntensity: BlurIntensity = "medium"
): string {
  const voiceoverLine = clientName
    ? `"${token.cta_line}" — ${clientName}.`
    : `"${token.cta_line}"`;

  const blur = BLUR_LANGUAGE[blurIntensity];

  return `[BACKGROUND PLATE — Google VEO 3 | 8s | 16:9 | Voiceover | Text-Free | Graphic Overlay Ready]
[BLUR INTENSITY: ${blur.label.toUpperCase()}]

[SCENE]
${token.cutaway_subject}
No people. No prominent foreground subject. Ambient environment only.

[VISUAL STYLE]
${token.cutaway_framing}
${blur.description}
No camera movement. No on-screen text. No logos. No titles.
Upper two-thirds of frame reserved as clear background plate for post-production graphic and logo overlay.

[AUDIO]
No diegetic sound. Near silence — ambient room tone only, barely perceptible.
Voiceover: Standard American English. Neutral Midwest accent. No regional inflection. No accent of any kind.
Delivery: calm, measured, unhurried. Not performative.
Line: ${voiceoverLine}
Voiceover triggers at 1.0s. Fades naturally to silence by 6.5s. Hold to 8.0s.

[POST NOTE]
This shot is a background plate. Upper frame reserved for CTA graphic and client logo overlay added in post-production.
Stitch to Scene Prompt (Prompt 1) in post-production. No in-camera titles, subtitles, or graphics.

[END]
Duration-lock: 8s. Text-free. ${blur.label} gaussian blur throughout. Background plate only. Graphic-overlay ready.`;
}

// ============================================================
// BLUR INTENSITY
// ============================================================

export type BlurIntensity = "subtle" | "light" | "medium" | "heavy" | "maximum";

const BLUR_LANGUAGE: Record<BlurIntensity, { label: string; description: string }> = {
  subtle:  { label: "Subtle",  description: "Very light gaussian blur — scene is clearly legible but softened. Edges slightly diffused. Background detail mostly visible." },
  light:   { label: "Light",   description: "Light gaussian blur — scene is soft and painterly. Background detail visible but diffused. Foreground elements gently hazed." },
  medium:  { label: "Medium",  description: "Moderate gaussian blur — scene is atmospheric. Background detail abstracted. Shapes and light sources visible as soft masses." },
  heavy:   { label: "Heavy",   description: "Heavy gaussian blur — scene is nearly abstract. Only broad shapes, light sources, and color fields remain. Detail is lost." },
  maximum: { label: "Maximum", description: "Maximum gaussian blur — full abstraction. Scene is a wash of color and light. No recognizable detail. Pure atmospheric background plate." },
};

export { BLUR_LANGUAGE };

// ============================================================
// SHOT BUILDER
// ============================================================

function buildShots(params: EpisodeParams, token: NET60Token, cameraLang: string, authorityLine: string): Shot[] {
  const shots: Shot[] = [];

  if (params.mode === "POC_SINGLE" || params.max_runtime_mode) {
    shots.push({
      number: 1,
      time_range: "0–8s",
      setting: token.setting_visual,
      authority: params.delorification ? "Off-screen AP voice (Delores)" : token.role_authority,
      dialogue: params.delorification
        ? (token.delores_variant || `Accounts Payable. This is Delores. ${token.net60_line}`)
        : `"${token.net60_line}"`,
      ambient: `Diegetic ambient sound. ${token.visual_contrast_beat}`,
      visual_end_beat: `${token.visual_contrast_beat} Hold 1.5 seconds. Hard cut.`,
    });
  } else if (params.mode === "POC_DOUBLE") {
    shots.push({
      number: 1,
      time_range: "0–8s",
      setting: token.setting_visual,
      authority: params.delorification ? "Off-screen AP voice (Delores)" : token.role_authority,
      dialogue: params.delorification
        ? (token.delores_variant || `Accounts Payable. This is Delores. ${token.net60_line}`)
        : `"${token.net60_line}"`,
      ambient: "Diegetic ambient sound continues.",
      visual_end_beat: "Hard cut to Shot 2.",
    });
    shots.push({
      number: 2,
      time_range: "0–8s",
      setting: `${token.setting_visual} — consequence framing.`,
      ambient: "Ambient sound fades. Near silence.",
      visual_end_beat: `${token.visual_contrast_beat} Hold 1.5 seconds. Silence before CTA.`,
    });
  } else {
    // EPISODIC — up to 4 shots
    shots.push({
      number: 1,
      time_range: "0–8s",
      setting: token.setting_visual,
      ambient: "Establish environment. Diegetic ambient sound.",
      visual_end_beat: "Establish scene. Hard cut.",
    });
    shots.push({
      number: 2,
      time_range: "0–8s",
      setting: `${token.setting_visual} — authority enters frame.`,
      authority: params.delorification ? "Off-screen AP voice (Delores)" : token.role_authority,
      dialogue: params.delorification
        ? (token.delores_variant || `Accounts Payable. This is Delores. ${token.net60_line}`)
        : `"${token.net60_line}"`,
      ambient: "Ambient sound continues under dialogue.",
      visual_end_beat: "Dialogue delivered. Hard cut.",
    });
    shots.push({
      number: 3,
      time_range: "0–8s",
      setting: `${token.setting_visual} — reaction framing.`,
      ambient: "Ambient sound fades.",
      visual_end_beat: `${token.visual_contrast_beat} Hold 1.5 seconds.`,
    });
    shots.push({
      number: 4,
      time_range: "0–8s",
      setting: "Silent hold on consequence. Minimal movement.",
      ambient: "Near silence. Single ambient tone.",
      visual_end_beat: "Silence. Hard cut to CTA Cutaway.",
    });
  }

  return shots;
}

// ============================================================
// TOKEN SELECTOR — Match by domain and urgency
// ============================================================

export function getTokenByDomain(domain: Domain, urgency?: UrgencyLevel): NET60Token {
  const domainTokens = NET60_TOKENS.filter((t) => t.domain === domain);
  if (domainTokens.length === 0) {
    return NET60_TOKENS[Math.floor(Math.random() * NET60_TOKENS.length)];
  }
  if (urgency) {
    const urgencyMatch = domainTokens.find((t) => t.urgency_level === urgency);
    if (urgencyMatch) return urgencyMatch;
  }
  return domainTokens[Math.floor(Math.random() * domainTokens.length)];
}

// ============================================================
// BATCH GENERATION — 10 Episodes
// ============================================================

export function generateBatch(batchParams: BatchParams): GeneratedEpisode[] {
  const episodes: GeneratedEpisode[] = [];

  const urgencyQueue: UrgencyLevel[] = [
    ...Array(batchParams.urgency_distribution.low).fill("Low"),
    ...Array(batchParams.urgency_distribution.moderate).fill("Moderate"),
    ...Array(batchParams.urgency_distribution.high).fill("High"),
    ...Array(batchParams.urgency_distribution.critical).fill("Critical"),
  ];

  const delorificationQueue: boolean[] = [
    ...Array(batchParams.delorification_ratio).fill(true),
    ...Array(10 - batchParams.delorification_ratio).fill(false),
  ];
  for (let i = delorificationQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [delorificationQueue[i], delorificationQueue[j]] = [delorificationQueue[j], delorificationQueue[i]];
  }

  const domains = [...batchParams.domains];
  while (domains.length < 10) {
    domains.push(domains[Math.floor(Math.random() * domains.length)]);
  }

  for (let i = 0; i < 10; i++) {
    const isExperimental = batchParams.experimental_slot && i === 9;
    const urgency = urgencyQueue[i] || "Moderate";
    const domain = domains[i];
    const delorified = delorificationQueue[i];

    const visualStyle = batchParams.visual_style_consistency === "Mixed but restrained"
      ? (["Locked tripod", "Subtle handheld", "Symmetrical frame"] as VisualStyle[])[i % 3]
      : batchParams.visual_style_consistency as VisualStyle;

    const ctaFocus = batchParams.cta_focus === "Mixed"
      ? (["Cash flow", "Payroll", "Working capital", "Growth", "Momentum"] as CTAFocus[])[i % 5]
      : batchParams.cta_focus as CTAFocus;

    const params: EpisodeParams = {
      mode: batchParams.structure_mode,
      domain,
      delorification: delorified,
      urgency_level: urgency,
      visual_style: visualStyle,
      setting_constraints: "No recurring characters",
      cta_focus: ctaFocus,
      tone_intensity: isExperimental ? "Slightly ironic" : batchParams.tone_baseline,
      additional_notes: isExperimental ? "Experimental slot — tonal deviation within franchise limits." : undefined,
      max_runtime_mode: batchParams.max_runtime_mode,
      client_subject_name: batchParams.client_subject_name,
    };

    episodes.push(generateEpisode(params));
  }

  return episodes;
}

// ============================================================
// VALIDATION
// ============================================================

export function validateEpisode(episode: GeneratedEpisode): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!episode.scenario_id) issues.push("Missing SCENARIO_ID");
  if (!episode.veo_prompt_1) issues.push("Missing VEO PROMPT 1 (Scene)");
  if (!episode.veo_prompt_2) issues.push("Missing VEO PROMPT 2 (CTA Cutaway)");
  if (!episode.cta) issues.push("Missing CTA");
  if (episode.shot_structure.length === 0) issues.push("No shots defined");

  if (episode.mode === "POC_SINGLE" && episode.shot_structure.length > 1) {
    issues.push("POC_SINGLE must have exactly 1 shot");
  }
  if (episode.mode === "POC_DOUBLE" && episode.shot_structure.length > 2) {
    issues.push("POC_DOUBLE must have at most 2 shots");
  }
  if (episode.mode === "EPISODIC" && episode.shot_structure.length > 4) {
    issues.push("EPISODIC must have at most 4 shots");
  }

  return { valid: issues.length === 0, issues };
}

export const ALL_DOMAINS: Domain[] = [
  "Food", "Health", "Utilities", "Transit", "Retail", "Finance",
  "Education", "Infrastructure", "Emergency", "Tech", "Logistics",
  "Entertainment", "Care", "Service", "Ceremony",
];

export const DEFAULT_BATCH_DOMAINS: Domain[] = [
  "Food", "Health", "Emergency", "Finance", "Infrastructure",
  "Tech", "Logistics", "Utilities", "Transit", "Retail",
];
