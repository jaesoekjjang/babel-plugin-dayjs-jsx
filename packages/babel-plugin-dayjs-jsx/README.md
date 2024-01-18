## Configuration

### babel.config.json

```json
{
  "plugins": [
    [
      "babel-plugin-dayjs-jsx",
      {
        "tag": "day", //By default
        "format": "YYYY-MM-DD HH:mm:ss"
      }
    ]
  ]
}
```

### day.d.ts

```
/// <reference types="babel-plugin-dayjs-jsx/client" />

```

### SomeComponent.{tsx, jsx}

```jsx
//  YYYY-MM-DD HH:mm:ss
<day>{new Date()}</day>
```
