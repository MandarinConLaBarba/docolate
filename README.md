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

## More Examples

TODO..

## API

TODO..