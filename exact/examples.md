# exact — examples

Each case shows the padded original, a pure-compression rewrite that loses precision, and the exact rewrite.

## 1. Bug report

**Original:**
> Sure! I'd be happy to help with that. After taking a look at the code, it seems like the issue you're experiencing is most likely caused by the token expiry check in the auth middleware, which appears to be using `<` instead of `<=`.

**Compression only:**
> Bug in auth middleware. Expiry check use `<` not `<=`. Fix:

Lost: "most likely". The cause is a guess, and the rewrite states it as a fact.

**exact:**
> The likely cause is the token expiry check in the auth middleware. It uses `<` where it should use `<=`.

## 2. Test status

**Original:**
> I've gone ahead and made the changes to the payment module, and everything should be working now, although I wasn't able to run the integration tests since the sandbox credentials weren't available.

**Compression only:**
> Payment module fixed. Working now.

Lost: the integration tests did not run. "Working" is an untested claim.

**exact:**
> I changed the payment module. Unit tests pass. I did not run the integration tests because the sandbox credentials are missing.

## 3. Conditional instruction

**Original:**
> You'll want to clear the cache before you deploy, but only if you've changed the schema, otherwise it isn't needed and it will just slow things down.

**Compression only:**
> Clear cache before deploy.

Lost: the condition. The reader now clears the cache on every deploy.

**exact:**
> Clear the cache before you deploy only if you changed the schema. Otherwise skip it. It slows the deploy.

## 4. Counts

**Original:**
> So I went through all of the files and basically found a bunch of places, around 12 or so, where the old API is still being used.

**exact:**
> 12 files still call the old API.

Only if you counted 12. If you estimated, write "about 12 files still call the old API."

## 5. Exact vs. Exact Dense

**Exact:**
> The migration failed on the `orders` table. The `status` column has null values, and the new constraint rejects them. Backfill the nulls, then run the migration again.

**Exact Dense:**
> - Migration failed: `orders` table
> - Cause: null `status` values → new NOT NULL constraint rejects them
> - Next: backfill nulls, rerun migration

## 6. Irreversible action (full prose)

> **Warning:** This command permanently deletes every row in the `users` table. You cannot undo it. Confirm that a current backup exists before you run it.
> ```sql
> DELETE FROM users;
> ```
