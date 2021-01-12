#!/bin/bash
PROD=true;
case "$1" in
-prod)echo "Deploy prod";;
*)PROD=false
esac
if $PROD;
firebase use lifecoach-6ab28;
echo "Use dev environment...";
git checkout master;
echo "Checkout master";
else 
firebase use livecoach-dev;
echo "Use dev environment...";
git checkout development;
echo "checkout development";
fi
rm -rf dist/;
echo "Dist removed";
yarn build:dev-ssr;
echo "Built";
cd functions;
npm run build;
echo "Functions prebuilt";
firebase deploy --only functions;
echo "functions deployed";
cd ../dist/browser/;
rm -f index.html;
cd ../../;
echo "index.html removed";
firebase deploy --only hosting;
echo "deployed hosting";
echo "Done";