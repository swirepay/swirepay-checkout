### Integrate Swirepay API in seconds

Quickly leverage Swirepay, to create your first customer, charge, and reconcile banking and payment details with your applications or accounting systems.

### Example

Please try this html snippet in your browser

```
<html>
  <head>
  </head>
  <body>
    <button onclick="window.pay(100, 'USD', 'Test US Payment')">Pay now</button>
    <button onclick="window.pay(100, 'CAD', 'Test CAD Payment', 'https://www.google.com')">Pay now</button>
  </body>
    <script
      type="text/javascript"
      src="https://unpkg.com/swirepay-checkout@latest/dist/swirepay-checkout.js"
      data-id="SwirepayCheckout"
      data-apiKey="pk_live_4jVlZXcXOBJg8RKUL4UvJbBbUP5h74un"
    >
    </script>
</html>
```
To use a different currency, please use appropriate ISO 4217 currency code
* List of ISO 4127 currency codes: https://en.wikipedia.org/wiki/ISO_4217
* Examples: CAD for Canadian Dollar, INR for Indian Rupee etc.

<!-- Demo available [here](https://codepen.io/payportal/pen/rNBoqyG) -->

### Deploy Example
`npm version patch -m "Upgrade to %s for reasons"`

`npm publish`

Change `patch` to `minor` or `major` etc.
https://docs.npmjs.com/cli/version
