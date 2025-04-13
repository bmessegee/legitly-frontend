export interface DashboardCard {
    id: string;
    cols: number;
    rows: number;
    title: string;
    description: string;
    icon: string;
    displayRoles: Array<string>;
    actionDisplay: string; 
    actionLink: string;
    actionQuery: string;
  }

  