import { DailyPlan, ScheduleItem, TeamMember, DispatchChannel } from '../types';
import { ACTIVITY_DEFINITIONS } from '../data/activityDefinitions';

// Helper to format date in English (e.g. "THURSDAY, AUGUST 27, 2026")
export function formatDateEnglish(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
}

// Helper to format date in title case English (e.g. "Friday, August 28, 2026")
export function formatDateTitleEnglish(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Activity line formatter for WhatsApp in English (Strictly NO emojis, NO horizontal lines)
export function formatActivityWhatsApp(item: ScheduleItem, members: TeamMember[]): string {
  const def = ACTIVITY_DEFINITIONS[item.type];
  let title = def?.label ? def.label.toUpperCase() : 'ACTIVITY';

  switch (item.type) {
    case 'arrival':
      title = 'ARRIVAL';
      break;
    case 'individual_workout':
      title = 'INDIVIDUAL WORK OUT';
      break;
    case 'positional_workout':
      title = 'POSITIONAL WORK OUT';
      break;
    case 'team_practice':
      const tapedLabel = item.tapedOption === 'taped' ? '[TAPED]' : '[NOT TAPED]';
      title = `TEAM PRACTICE ${tapedLabel}`;
      break;
    case 'taping_session':
      title = 'TAPING SESSION';
      break;
    case 'weights':
      title = 'WEIGHTS';
      break;
    case 'video_meeting':
      title = 'VIDEO MEETING';
      break;
    case 'recovery':
      title = 'RECOVERY';
      break;
    case 'team_event':
      title = 'TEAM EVENT';
      break;
    case 'team_meal':
      const mealLabels: Record<string, string> = {
        breakfast: 'BREAKFAST',
        lunch: 'LUNCH',
        dinner: 'DINNER',
        snack: 'SNACK'
      };
      const mealName = item.mealType ? (mealLabels[item.mealType] || item.mealType.toUpperCase()) : 'MEAL';
      title = `TEAM MEAL [${mealName}]`;
      break;
    case 'departure_time':
      const luggageLabel = item.luggageOption === 'with_luggage' ? '[WITH LUGGAGE]' : '[WITHOUT LUGGAGE]';
      title = `DEPARTURE TIME ${luggageLabel}`;
      break;
    case 'custom':
      title = item.customTitle ? item.customTitle.toUpperCase() : 'CUSTOM ACTIVITY';
      break;
  }

  let timeString = `*${item.time}*`;
  if (item.endTime) {
    timeString = `*${item.time} - ${item.endTime}*`;
  }

  const lines: string[] = [];
  lines.push(`${timeString} ${title}`);

  if (item.location) {
    lines.push(`Location: ${item.location}`);
  }

  if (item.locationUrl) {
    lines.push(`Google Maps: ${item.locationUrl}`);
  }

  // If specific members assigned
  if (item.targetAudience === 'selected_members' && item.assignedMemberIds && item.assignedMemberIds.length > 0) {
    const assignedNames = item.assignedMemberIds
      .map(id => {
        const m = members.find(x => x.id === id);
        return m ? (m.jerseyNumber !== undefined ? `#${m.jerseyNumber} ${m.name}` : m.name) : '';
      })
      .filter(Boolean)
      .join(', ');
    lines.push(`Members: ${assignedNames}`);
  } else if (item.targetAudience === 'basketball_coaches') {
    lines.push(`Target: Basketball Coaches`);
  } else if (item.targetAudience === 'staff_only') {
    lines.push(`Target: Coaching Staff Only`);
  } else if (item.targetAudience === 'players_only') {
    lines.push(`Target: Players Only`);
  }

  if (item.notes) {
    lines.push(`Note: ${item.notes}`);
  }

  return lines.join('\n');
}

// Generate full WhatsApp message for any channel / recipient in English
export function generateWhatsAppMessage(
  plan: DailyPlan,
  channel: DispatchChannel,
  members: TeamMember[],
  recipientMember?: TeamMember
): string {
  const dateFormatted = formatDateEnglish(plan.date);

  let introGreeting = '';

  if (recipientMember) {
    introGreeting = `Hi ${recipientMember.name},\nHere is your schedule for tomorrow:`;
  } else {
    switch (channel) {
      case 'collective_staff':
        introGreeting = `COACHING STAFF SCHEDULE\nStaff, here is the breakdown of tomorrow's sessions:`;
        break;
      case 'all_team':
      default:
        introGreeting = `OFFICIAL TEAM SCHEDULE\nTeam schedule for tomorrow:`;
        break;
    }
  }

  // Filter items if it's an individual recipient
  let visibleItems = [...plan.items];
  
  // Sort items by time
  visibleItems.sort((a, b) => a.time.localeCompare(b.time));

  const specificItems: ScheduleItem[] = [];
  const generalItems: ScheduleItem[] = [];

  if (recipientMember) {
    visibleItems.forEach(item => {
      const hasSpecificAssignments = Boolean(item.assignedMemberIds && item.assignedMemberIds.length > 0);

      if (item.targetAudience === 'selected_members' || hasSpecificAssignments) {
        if (item.assignedMemberIds && item.assignedMemberIds.includes(recipientMember.id)) {
          specificItems.push(item);
        }
      } else if (item.targetAudience === 'basketball_coaches') {
        const COACHES_IDS = ['s-sito-alonso', 's-lucas-perez', 's-dimitris-tsesmetzis', 's-antonio-lozano'];
        const isCoach = COACHES_IDS.includes(recipientMember.id) || 
          ['sito alonso', 'lucas pérez', 'lucas perez', 'dimitris', 'antonio lozano'].some(n => recipientMember.name.toLowerCase().includes(n));
        if (isCoach) {
          generalItems.push(item);
        }
      } else if (item.targetAudience === 'players_only') {
        if (recipientMember.role === 'player') {
          generalItems.push(item);
        }
      } else if (item.targetAudience === 'staff_only') {
        if (recipientMember.role === 'staff' || recipientMember.role === 'medical') {
          generalItems.push(item);
        }
      } else {
        // All team
        generalItems.push(item);
      }
    });
  } else if (channel === 'collective_staff') {
    // Staff sees all items
  }

  // Header: Clean, strictly in English, No match title, No emojis, No horizontal lines
  const header = `UCAM MURCIA CB\n${dateFormatted}\n\n${introGreeting}`;

  let body = '';

  if (recipientMember && specificItems.length > 0) {
    body += `\n\n_INDIVIDUAL SESSIONS_\n`;
    body += specificItems.map(item => formatActivityWhatsApp(item, members)).join('\n\n');
    if (generalItems.length > 0) {
      body += `\n\n_TEAM SCHEDULE_\n`;
      body += generalItems.map(item => formatActivityWhatsApp(item, members)).join('\n\n');
    }
  } else if (recipientMember) {
    // If no specific individual items are assigned to this member, output team schedule directly without individual header
    body += `\n\n` + generalItems.map(item => formatActivityWhatsApp(item, members)).join('\n\n');
  } else {
    body += `\n\n` + visibleItems.map(item => formatActivityWhatsApp(item, members)).join('\n\n');
  }

  return `${header}${body}`;
}

// Clean phone number to international WhatsApp standard
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.length === 9) {
      // Default to Spain +34 if 9 digits
      cleaned = '+34' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned.replace('+', '');
}

// Create WhatsApp direct URL for a phone number (Universal api.whatsapp.com)
export function buildWhatsAppUrl(phone: string, message: string): string {
  const numericPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${numericPhone}&text=${encodedText}`;
}

// Create WhatsApp direct link for sharing to any chat or group
export function buildWhatsAppShareUrl(message: string): string {
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
