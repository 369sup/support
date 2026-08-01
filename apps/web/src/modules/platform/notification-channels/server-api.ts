import { notificationChannelsServerFacade } from "./composition/notification-channels.composition";

export const deliverEmail =
  notificationChannelsServerFacade.deliverEmail;
export const getChannelDelivery =
  notificationChannelsServerFacade.getChannelDelivery;
