how-to
1. git clone https://github.com/eechern/Tourbooking.git
2. npm i
3. npm run start (application will run on http://localhost:3000)
4. to test users login with [sophie@example.com || password=$2a$12$9nFqToiTmjgfFVJiQvjmreLt4k8X4gGYCETGapSZOb2hHa55t0dDq]
5. (stripe payment test)
   - use creditcard no (4242 4242 4242 4242) for payment processing test
   - !!! user will not be able to see bookings after payment. This is because the application relies on Stripe Webhooks, which do not work on localhost.

--potential bugs solutions--

(data might not be updated)
1. node dev-data/data/import-dev-data.js --delete
2. node dev-data/data/import-dev-data.js --import
3. npm run start

--notes/misc--
1. .env file has been included for your convinence
