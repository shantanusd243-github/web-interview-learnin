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

export function priorityBadgeClass(p) {
  const map = {
    // Add the new Enum strings from the API
    'MUST_KNOW': 'badge-must',
    'IMPORTANT': 'badge-important',
    'NICE_TO_KNOW': 'badge-nice',

    // Keep the old ones just in case any cached data exists in local state
    'Must Know': 'badge-must',
    'Important': 'badge-important',
    'Nice to Know': 'badge-nice'
  };

  // If it doesn't match any of the above, it drops the color
  return map[p] || 'badge-topic';
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
