export function difficultyBadgeClass(d) {
  if (!d) return 'badge-topic';
  const map = {
    Beginner: 'badge-beginner',
    Intermediate: 'badge-intermediate',
    Advanced: 'badge-advanced',
    Senior: 'badge-senior',
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  };
  return map[d] || `badge-${d.toLowerCase()}`;
}

export function priorityBadgeClass(priority) {
  switch (priority) {
    case 'MUST_KNOW':
    case 'Must Know': // Keep the old one just in case during transition
      return 'badge-red'; // or whatever your class is
    case 'IMPORTANT':
    case 'Important':
      return 'badge-yellow';
    case 'NICE_TO_KNOW':
    case 'Nice to Know':
      return 'badge-green';
    default:
      return 'badge-default';
  }
}

export const TOPIC_ICONS = {
  'Core Java': '☕',
  'Java 8': '🚀',
  Collections: '📦',
  Multithreading: '🔄',
  String: '🔤',
  OOP: '🧬',
  'Design Patterns': '🏗️',
  'Spring Boot': '🍃',
  'REST APIs': '🌐',
  Microservices: '🔗',
  SQL: '🗄️',
  'Exception Handling': '⚠️',
};

export function topicIcon(topic) {
  return TOPIC_ICONS[topic] || '📌';
}

export const STATUS_LABELS = {
  NOT_STARTED: '○ Not Started',
  REVISING: '↻ Revising',
  CONFIDENT: '✓ Confident',
  WEAK: '✗ Weak',
};

export const STATUS_CLASSES = {
  NOT_STARTED: 'status-not-started',
  REVISING: 'status-revising',
  CONFIDENT: 'status-confident',
  WEAK: 'status-weak',
};

export const STATUS_CYCLE = ['NOT_STARTED', 'REVISING', 'CONFIDENT', 'WEAK'];

export function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current || 'NOT_STARTED');
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}
