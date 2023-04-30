# banana_dev.js

https://banana.dev/ API in javascript for static site

Converted from [banana-python-sdk](https://github.com/bananaml/banana-python-sdk)

Example:


HTML:
```html
  <script src="./banana_dev.js"></script>
```

JS:
```js
  const modelInputs = {
    thing: "thing"
  };

  const apiKey = "c9a5be2f-0000-0000-8599-00000b24bfa3";
  const modelKey = "4a4f2fe0-0000-0000-b8dc-00000b8458a9";
  const result = await window.runMain(apiKey, modelKey, modelInputs);
  console.log(result);
  ```
 
