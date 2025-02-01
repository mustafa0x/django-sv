from fastapi import FastAPI

app = FastAPI(
    title="django-sv",
    # debug=IS_DEBUG,
    docs_url="/api/docs",
)


@app.get("/")
async def root():
    return {"message": "Hello World2"}


@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
