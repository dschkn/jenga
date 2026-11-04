export interface Room { id: string; title: string; memberIds: string[] }
export interface Message { id: string; roomId: string; authorId: string; text: string; createdAt: string }
export interface PlatformEvent { id: string; title: string; entityId: string; kind: 'group-start' | 'group-cancel' | 'inbox' | 'call' | 'publish'; createdAt: string; readBy: string[] }
export interface InboxItem { id: string; source: 'website' | 'email'; name: string; text: string; status: 'new' | 'in_progress' | 'closed' | 'spam'; assigneeId: string; createdAt: string }
export interface CallRecord { id: string; inboxId: string; direction: 'incoming' | 'outgoing'; outcome: 'connected' | 'no_answer' | 'refused'; reason: string; note: string; createdAt: string }
export interface Post { id: string; groupId: string; text: string; channel: string; status: 'draft' | 'scheduled' | 'simulated'; scheduledAt: string; createdAt: string }
export interface DemoState { version: number; rooms: Room[]; messages: Message[]; events: PlatformEvent[]; inbox: InboxItem[]; calls: CallRecord[]; posts: Post[] }
export interface DemoRepository {
 read(): DemoState; reset(): void;
 createRoom(title: string, memberIds?: string[]): string;
 send(roomId: string, authorId: string, text: string): void;
 markRead(eventId: string, userId: string): void;
 groupStarted(group: { id: string; name: string; startDate: string }): void;
 groupCancelled(groupId: string): void;
 receive(source: InboxItem['source'], name: string, text: string): string;
 updateInbox(id: string, status: InboxItem['status'], assigneeId: string): void;
 logCall(inboxId: string, direction: CallRecord['direction'], outcome: CallRecord['outcome'], reason: string, note: string): string;
 savePost(post: Pick<Post, 'text' | 'channel' | 'scheduledAt'> & {id?: string; groupId?: string; status: 'draft' | 'scheduled'}): string;
 simulatePublish(id: string): void; deletePost(id: string): void;
}
/** Contract only: production adapters are deliberately not instantiated. */
export interface FutureIntegrations {
 inbox: { receive(): Promise<InboxItem[]> };
 calls: { dial(contactId: string): Promise<void> };
 publish: { publish(post: Post): Promise<string> };
}
export const DEMO_KEY: string;
export function emptyState(): DemoState;
export function createDemoRepository(storage?: Pick<Storage, 'getItem' | 'setItem'>, notify?: () => void): DemoRepository;
export function getDemoRepository(): DemoRepository;
export function subscribeDemo(listener: () => void): () => void;
