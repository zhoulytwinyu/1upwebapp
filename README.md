# run locally

```
npm run dev
```

# deploy via serverless
only need to do the create domain the first time
```
sls create_domain --region us-east-2 --aws-profile dev
```

then for any updates
```
npm run build && sls deploy --region us-east-2 --aws-profile dev
```

export ONEUPHEALTH_MYSQL_DB="xxxxxx"
export ONEUPHEALTH_POSTGRES_DB="xxxxx"

# test locally
http://localhost:3000
