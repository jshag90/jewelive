// Centralized Firebase Auth error → 한글 안내 매핑.
// Login/Register/소셜 로그인 모두 이 함수를 공유한다.

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': '이메일 형식이 올바르지 않아요.',
  'auth/missing-password': '비밀번호를 입력해 주세요.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 일치하지 않아요.',
  'auth/wrong-password': '이메일 또는 비밀번호가 일치하지 않아요.',
  'auth/user-not-found': '이메일 또는 비밀번호가 일치하지 않아요.',
  'auth/too-many-requests': '잠시 후 다시 시도해 주세요.',
  'auth/popup-closed-by-user': '로그인을 취소했어요.',
  'auth/popup-blocked': '브라우저가 팝업을 차단했어요. 새 창 허용 후 다시 시도해 주세요.',
  'auth/unauthorized-domain':
    '이 도메인은 Firebase Authentication에서 승인되지 않았어요. 관리자에게 문의해 주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했어요. 연결 상태를 확인해 주세요.',
  'auth/operation-not-allowed':
    '이 로그인 방식이 아직 활성화되지 않았어요. 잠시 후 다시 시도해 주세요.',
  'auth/email-already-in-use': '이미 사용 중인 이메일이에요. 로그인해 주세요.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
};

export function firebaseAuthErrorMessage(code?: string, fallback?: string): string {
  if (code && MESSAGES[code]) return MESSAGES[code];
  return fallback || '요청을 처리하지 못했어요.';
}
