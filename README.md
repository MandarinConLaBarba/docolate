# Docolate

Docolate (a contraction of "Doc" and "Chocolate") is a documentation generator for the Express framework.

## Usage

Initialize docolate and specify a route for viewing the documentation:

```
var doc = docolate.create(app);
app.get('/docs', doc.route('html'));
```

Then just add some routes as one usually would:

```
app.get('/some/route', function(req, res){});
app.get('/some/route/with/:param', function(req, res){});
app.post('/some/other/route', function(req, res){});
```
Finally start the app:

```
app.listen(3030);
```

Then you can view the generated documentation in the path specified above (i.e. http://localhost:3030/docs).

## Multiple formats

Change the output format like so:

```
 app.get('/docs', doc.route('markdown'));
 app.get('/docs', doc.route('html'));
 app.get('/docs', doc.route('json'));
```

## Exclusions/Inclusions

Exclusions and inclusions accept a string or an array of glob (String) or regular expressions (RegExp). Exclusions trump
inclusions. Inclusions have the effect of excluding anything that does NOT match.

```
var doc = docolate.create(app)
    .exclude(["/accounts/*", /^\/account.+/])
    .include(/^\/orders\/.+/);
```

## Advanced

Add additional documentation to a route.

Short form just adds a description:

```
app.post("/items/", function(req, res) {})
    .describe("Create a new item");
```

More documentation can be provided w/ long form:

```
app.get("/items/:itemId", function(req, res) {
    res.send("an item");
}).describe({
    description : "fetches a single item",
    params : {
        itemId : "an item ID",
        type : "Number"
    },
    returns : "Item"
});

app.post("/items", function(req, res) {
    res.send("a item ID");
}).describe({
    description : "creates a new item",
    body : {
        item : "Item"
    },
    returns : "item ID"
});
```

## API

TODO..