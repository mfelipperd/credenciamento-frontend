import { useAxio } from "@/hooks/useAxio";
import { AppEndpoints } from "@/constants/AppEndpoints";
import type { CreateExhibitor, CreateExhibitorFair, CreateExhibitorMember, Exhibitor, ExhibitorFair, ExhibitorMember, MemberRole } from "@/interfaces/exhibitors";

export const useExhibitorsService = () => {
  const api = useAxio();
  return {
    list: () => api.get<Exhibitor[]>(AppEndpoints.EXHIBITORS.BASE).then(r => r.data),
    create: (data: CreateExhibitor) => api.post<Exhibitor>(AppEndpoints.EXHIBITORS.BASE, data).then(r => r.data),
    team: (id: string) => api.get<ExhibitorMember[]>(AppEndpoints.EXHIBITORS.TEAM(id)).then(r => r.data),
    addMember: (id: string, data: CreateExhibitorMember) => api.post<ExhibitorMember>(AppEndpoints.EXHIBITORS.TEAM(id), data).then(r => r.data),
    fairs: (id: string) => api.get<ExhibitorFair[]>(AppEndpoints.EXHIBITORS.FAIRS(id)).then(r => r.data),
    addFair: (id: string, data: CreateExhibitorFair) => api.post<ExhibitorFair>(AppEndpoints.EXHIBITORS.FAIRS(id), data).then(r => r.data),
    linkClient: (id: string, clientId: string) => api.post(AppEndpoints.EXHIBITORS.FINANCE_CLIENTS(id), { clientId }).then(r => r.data),
    credentialMember: (participationId: string, memberId: string) => api.post(AppEndpoints.EXHIBITORS.CREDENTIAL_MEMBER(participationId, memberId)).then(r => r.data),
    invite: (id: string, email: string, role: MemberRole) => api.post(AppEndpoints.EXHIBITORS.INVITATIONS(id), { email, role }).then(r => r.data),
    acceptInvitation: (token: string) => api.post(AppEndpoints.EXHIBITORS.ACCEPT_INVITATION, { token }).then(r => r.data),
    myOrganizations: () => api.get(AppEndpoints.EXHIBITORS.MY_ORGANIZATIONS).then(r => r.data),
  };
};
