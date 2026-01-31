from langgraph.store.sqlite import SqliteStore

def get_global_memory_store():
    """Get global sqlite memory store"""
    with SqliteStore.from_conn_string(":memory:") as store:
        store.setup()

    return store