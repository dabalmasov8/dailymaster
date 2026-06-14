export interface TeamMember {
  id: string;
  name: string;
  position: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}
