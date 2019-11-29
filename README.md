# Pattern Extractor component of IoT Crawler

## Running the service

```bash
npm run dev
```

### Running in Production mode

1. Build the service
   ```bash
   npm run build
   ```
2. Start the service
   ```bash
   npm run start
   ```

**Alternative**
To run the service inside a container follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md).

### First time setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Setup and Start mongo
   MongoDB setup instructions are located in: [DEPLOYMENT.md](./DEPLOYMENT.md).
3. Create a `.env` file (copy from `.env.example`) and set the variables appropriately

## Registering a Model for Pattern Extractor to use

### Traffic
```jsonnet
POST /api/model

{
    "observableProperties": [
        "urn:ngsi-ld:ObservableProperty:aarhus:traffic:avgMeasuredTime",
        "urn:ngsi-ld:ObservableProperty:aarhus:traffic:avgSpeed"
    ],
    "model": "gANjc2tsZWFybi5taXh0dXJlLmdhdXNzaWFuX21peHR1cmUKR2F1c3NpYW5NaXh0dXJlCnEAKYFxAX1xAihYDAAAAG5fY29tcG9uZW50c3EDSwNYAwAAAHRvbHEERz9QYk3S8an8WAkAAAByZWdfY292YXJxBUc+sMb3oLXtjVgIAAAAbWF4X2l0ZXJxBktkWAYAAABuX2luaXRxB0sBWAsAAABpbml0X3BhcmFtc3EIWAYAAABrbWVhbnNxCVgMAAAAcmFuZG9tX3N0YXRlcQpOWAoAAAB3YXJtX3N0YXJ0cQuJWAcAAAB2ZXJib3NlcQxLAFgQAAAAdmVyYm9zZV9pbnRlcnZhbHENSwpYDwAAAGNvdmFyaWFuY2VfdHlwZXEOWAQAAABmdWxscQ9YDAAAAHdlaWdodHNfaW5pdHEQTlgKAAAAbWVhbnNfaW5pdHERTlgPAAAAcHJlY2lzaW9uc19pbml0cRJOWAoAAABjb252ZXJnZWRfcROIWAgAAAB3ZWlnaHRzX3EUY3NrbGVhcm4uZXh0ZXJuYWxzLmpvYmxpYi5udW1weV9waWNrbGUKTnVtcHlBcnJheVdyYXBwZXIKcRUpgXEWfXEXKFgIAAAAc3ViY2xhc3NxGGNudW1weQpuZGFycmF5CnEZWAUAAABzaGFwZXEaSwOFcRtYBQAAAG9yZGVycRxYAQAAAENxHVgFAAAAZHR5cGVxHmNudW1weQpkdHlwZQpxH1gCAAAAZjhxIEsASwGHcSFScSIoSwNYAQAAADxxI05OTkr/////Sv////9LAHRxJGJYCgAAAGFsbG93X21tYXBxJYh1YvAWfLAF+Ns/cG6ZM4Od0z+neuobd2rQP1gGAAAAbWVhbnNfcSZoFSmBcSd9cSgoaBhoGWgaSwNLAoZxKWgcaB1oHmgiaCWIdWI3p/PwMpHHP7Jkf3E2L+2/wKWXN1KIgj8m99zU4evtP1s9Vzwc7+0/GGfdRtc9xb9YDAAAAGNvdmFyaWFuY2VzX3EqaBUpgXErfXEsKGgYaBloGksDSwJLAodxLWgcaB1oHmgiaCWIdWJ1CZ3cR1XAP0G5wU3n94Q/QbnBTef3hD+hbyTIkZJ7P3ZIkLd5nrs/oWN6G803cT+hY3obzTdxP7Lv8XilJpI/9cvix3fzej8QOuAMl06RPxA64AyXTpE/v47ZLypBtz9YFAAAAHByZWNpc2lvbnNfY2hvbGVza3lfcS5oFSmBcS99cTAoaBhoGWgaSwNLAksCh3ExaBxoHWgeaCJoJYh1YoXHjOU9ZQZAXohdMwez8L8AAAAAAAAAAG7mbIL9AypA1/BVoSFbCEDYtGDZI9HSvwAAAAAAAAAADGFRrhYvHkC4mNrf7acoQEryhAcllyfAAAAAAAAAAADLVpyuLl4SQFgLAAAAcHJlY2lzaW9uc19xMmgVKYFxM31xNChoGGgZaBpLA0sCSwKHcTVoHGgdaB5oImgliHVi/cfNnTHaIUDMvtPbFScrwMy+09sVJyvATMNRc3wmZUDLyy12+LUiQGiiux7CvwHAaKK7HsK/AcBpuIjRj3hMQIDG+JiyMXJAk2f+deYUS8CTZ/515hRLwLmj620TFjVAWAcAAABuX2l0ZXJfcTZLBVgMAAAAbG93ZXJfYm91bmRfcTdjbnVtcHkuY29yZS5tdWx0aWFycmF5CnNjYWxhcgpxOGgiQwjHhMZD1ODUv3E5hnE6UnE7WBAAAABfc2tsZWFybl92ZXJzaW9ucTxYBgAAADAuMjAuMXE9dWIu",
    "labels": [
        "Medium Traffic",
        "Low Traffic",
        "High Traffic"
    ]
}
```

### Wind
```jsonnet
POST /api/model

{
    "observableProperties": [
        "urn:ngsi-ld:ObservableProperty:aarhus:wind:speed",
        "urn:ngsi-ld:ObservableProperty:aarhus:wind:vane"
    ],
    "model": "gANjc2tsZWFybi5taXh0dXJlLmdhdXNzaWFuX21peHR1cmUKR2F1c3NpYW5NaXh0dXJlCnEAKYFxAX1xAihYDAAAAG5fY29tcG9uZW50c3EDSwNYAwAAAHRvbHEERz9QYk3S8an8WAkAAAByZWdfY292YXJxBUc+sMb3oLXtjVgIAAAAbWF4X2l0ZXJxBktkWAYAAABuX2luaXRxB0sBWAsAAABpbml0X3BhcmFtc3EIWAYAAABrbWVhbnNxCVgMAAAAcmFuZG9tX3N0YXRlcQpOWAoAAAB3YXJtX3N0YXJ0cQuJWAcAAAB2ZXJib3NlcQxLAFgQAAAAdmVyYm9zZV9pbnRlcnZhbHENSwpYDwAAAGNvdmFyaWFuY2VfdHlwZXEOWAQAAABmdWxscQ9YDAAAAHdlaWdodHNfaW5pdHEQTlgKAAAAbWVhbnNfaW5pdHERTlgPAAAAcHJlY2lzaW9uc19pbml0cRJOWAoAAABjb252ZXJnZWRfcROIWAgAAAB3ZWlnaHRzX3EUY3NrbGVhcm4uZXh0ZXJuYWxzLmpvYmxpYi5udW1weV9waWNrbGUKTnVtcHlBcnJheVdyYXBwZXIKcRUpgXEWfXEXKFgIAAAAc3ViY2xhc3NxGGNudW1weQpuZGFycmF5CnEZWAUAAABzaGFwZXEaSwOFcRtYBQAAAG9yZGVycRxYAQAAAENxHVgFAAAAZHR5cGVxHmNudW1weQpkdHlwZQpxH1gCAAAAZjhxIEsASwGHcSFScSIoSwNYAQAAADxxI05OTkr/////Sv////9LAHRxJGJYCgAAAGFsbG93X21tYXBxJYh1YmllB4IPnNw/oJX5Zf4W2T/tCf4v5JnEP1gGAAAAbWVhbnNfcSZoFSmBcSd9cSgoaBhoGWgaSwNLAoZxKWgcaB1oHmgiaCWIdWIKWjrYeeONvzyVTknTU++/i3fDXS/y7j+7vkTzPQK1P/sut250u+Q/Qe6oiyIa579YDAAAAGNvdmFyaWFuY2VzX3EqaBUpgXErfXEsKGgYaBloGksDSwJLAodxLWgcaB1oHmgiaCWIdWKAOIP0JDqkP4HIMsRPUni/gcgyxE9SeL+mTuwfirxePwLqMqDvHGw/IQwQoSOvhL8hDBChI6+Ev2+eDvyb96s/cf75eEBXoD+idnrO/2+dP6J2es7/b50/rgcTibDJmz9YFAAAAHByZWNpc2lvbnNfY2hvbGVza3lfcS5oFSmBcS99cTAoaBhoGWgaSwNLAksCh3ExaBxoHWgeaCJoJYh1YpUZrKvnHxRAwIwCv6UrE0AAAAAAAAAAACwyUOLw4j9A/1OqIP8RMUDvV6q6gaYyQAAAAAAAAAAA7EAmVVBZGUBQlc4Q5GMWQFNsKEtDjTnAAAAAAAAAAADfWrl2JF48QFgLAAAAcHJlY2lzaW9uc19xMmgVKYFxM31xNChoGGgZaBpLA0sCSwKHcTVoHGgdaB5oImgliHVixtOfwREkSECx4I4iPRpjQLHgjiI9GmNA7VYNKPzFj0Bv9reH3fmDQJNKEolGjF1Ak0oSiUaMXUDcFK/MhhREQJfYjNXRYYVAdsMo9camhsB2wyj1xqaGwNZsJ8bUJYlAWAcAAABuX2l0ZXJfcTZLBFgMAAAAbG93ZXJfYm91bmRfcTdjbnVtcHkuY29yZS5tdWx0aWFycmF5CnNjYWxhcgpxOGgiQwgCAw2JEyvxP3E5hnE6UnE7WBAAAABfc2tsZWFybl92ZXJzaW9ucTxYBgAAADAuMjAuMXE9dWIu",
    "labels": [
        "Light",
        "Strong",
        "Medium"
    ]
}
```

### Air Quality
```jsonnet
POST /api/model

{
    "observableProperties": [
        "urn:ngsi-ld:ObservableProperty:aarhus:air:particullate",
        "urn:ngsi-ld:ObservableProperty:aarhus:air:nitrogen"
    ],
    "model": "gANjc2tsZWFybi5taXh0dXJlLmdhdXNzaWFuX21peHR1cmUKR2F1c3NpYW5NaXh0dXJlCnEAKYFxAX1xAihYDAAAAG5fY29tcG9uZW50c3EDSwNYAwAAAHRvbHEERz9QYk3S8an8WAkAAAByZWdfY292YXJxBUc+sMb3oLXtjVgIAAAAbWF4X2l0ZXJxBktkWAYAAABuX2luaXRxB0sBWAsAAABpbml0X3BhcmFtc3EIWAYAAABrbWVhbnNxCVgMAAAAcmFuZG9tX3N0YXRlcQpOWAoAAAB3YXJtX3N0YXJ0cQuJWAcAAAB2ZXJib3NlcQxLAFgQAAAAdmVyYm9zZV9pbnRlcnZhbHENSwpYDwAAAGNvdmFyaWFuY2VfdHlwZXEOWAQAAABmdWxscQ9YDAAAAHdlaWdodHNfaW5pdHEQTlgKAAAAbWVhbnNfaW5pdHERTlgPAAAAcHJlY2lzaW9uc19pbml0cRJOWAoAAABjb252ZXJnZWRfcROIWAgAAAB3ZWlnaHRzX3EUY3NrbGVhcm4uZXh0ZXJuYWxzLmpvYmxpYi5udW1weV9waWNrbGUKTnVtcHlBcnJheVdyYXBwZXIKcRUpgXEWfXEXKFgIAAAAc3ViY2xhc3NxGGNudW1weQpuZGFycmF5CnEZWAUAAABzaGFwZXEaSwOFcRtYBQAAAG9yZGVycRxYAQAAAENxHVgFAAAAZHR5cGVxHmNudW1weQpkdHlwZQpxH1gCAAAAZjhxIEsASwGHcSFScSIoSwNYAQAAADxxI05OTkr/////Sv////9LAHRxJGJYCgAAAGFsbG93X21tYXBxJYh1Yngj6sF9w9E/CaKHtWKb1j+DOo6IH6HXP1gGAAAAbWVhbnNfcSZoFSmBcSd9cSgoaBhoGWgaSwNLAoZxKWgcaB1oHmgiaCWIdWKpRwYn8SXtP95knQpl2NA/p70VKAhq4z/pnSRFuqHnv9wtauXx8s2/J24tnIDM7b9YDAAAAGNvdmFyaWFuY2VzX3EqaBUpgXErfXEsKGgYaBloGksDSwJLAodxLWgcaB1oHmgiaCWIdWJ3xp7JGrCBPwak1t1OR5m/BqTW3U5Hmb9LTOzYVKa3P5JroQuX/6g/1pLEX9gcpT/WksRf2BylP1xBW5ZJUaM/NATpNCB0sj8NiT3dAdaSvw2JPd0B1pK/vfQMFLyheD9YFAAAAHByZWNpc2lvbnNfY2hvbGVza3lfcS5oFSmBcS99cTAoaBhoGWgaSwNLAksCh3ExaBxoHWgeaCJoJYh1YnLU8K1NhSVAwcgliFpZM0AAAAAAAAAAAMKRsjTsExtAuZDaUT4aEkBOEMGQ71gvwAAAAAAAAAAAPqVwNfOOMkDmVCdI+csNQIhoTnDyGBxAAAAAAAAAAABm3i0l8IY7QFgLAAAAcHJlY2lzaW9uc19xMmgVKYFxM31xNChoGGgZaBpLA0sCSwKHcTVoHGgdaB5oImgliHViFebjpbqifkAwkHlDcF9gQDCQeUNwX2BApXM7AKvpRkChYcQeV6JwQAzLM6gPLnLADMszqA8ucsAx66JjoIZ1QNKaprZtm09Agtm34YcraECC2bfhhytoQE71/kDurYdAWAcAAABuX2l0ZXJfcTZLAlgMAAAAbG93ZXJfYm91bmRfcTdjbnVtcHkuY29yZS5tdWx0aWFycmF5CnNjYWxhcgpxOGgiQwh/jIcVBE/iP3E5hnE6UnE7WBAAAABfc2tsZWFybl92ZXJzaW9ucTxYBgAAADAuMjAuMXE9dWIu",
    "labels": [
        "Low Risk",
        "High Risk",
        "Medium Risk"
    ]
}
```