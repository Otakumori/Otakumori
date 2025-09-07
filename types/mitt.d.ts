declare module 'mitt' {
  type EventType = string | symbol;
  type Handler<T = any> = (event: T) => void;
  type WildcardHandler<T = any> = (type: EventType, event: T) => void;
  type EventHandlerList<T = any> = Array<Handler<T>>;
  type WildCardEventHandlerList<T = any> = Array<WildcardHandler<T>>;
  type EventHandlerMap<T = any> = Map<EventType, EventHandlerList<T> | WildCardEventHandlerList<T>>;

  interface Emitter<T = any> {
    all: EventHandlerMap<T>;
    on<Key extends keyof T>(type: Key, handler: Handler<T[Key]>): void;
    on(type: '*', handler: WildcardHandler<T>): void;
    off<Key extends keyof T>(type: Key, handler?: Handler<T[Key]>): void;
    off(type: '*', handler: WildcardHandler<T>): void;
    emit<Key extends keyof T>(type: Key, event: T[Key]): void;
    emit(type: '*', event: any): void;
    clear(): void;
  }

  function mitt<T = any>(all?: EventHandlerMap<T>): Emitter<T>;
  export = mitt;
}
