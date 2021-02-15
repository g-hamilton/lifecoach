#!/bin/bash
PROD=true
ISWIN=false

# settings (os, prod/dev);
case "$1" in
-prod) ;;
*) PROD=false ;;
esac

if $PROD; then
  echo -e "Starting development process...\n\n\t\tPRODUCTION"
else
  echo -e "Starting development process...\n\n\t\tDEVELOPMENT"
fi

#if [[ "$OSTYPE" == "win32" ]];
#then ISWIN=true;
#echo "warn: WINDOWS SYSTEM DETECTED";
#fi
## checking out to firebase project
#if $PROD;
#then
#firebase use lifecoach-6ab28 >> deployment_log.txt;
#echo -e "Using prod environment...\n\nProject: lifecoach-6ab28\n\n";
#else firebase use livecoach-dev >> deployment_log.txt;
#echo -e "Using dev environment...\n\nProject: livecoach-dev\n\n";
#fi
#
##git checkout
#if $PROD;
#then git checkout master;
#echo -e "Checkouted master\n\n";
#else git checkout development;
#echo -e "Checkouted development\n\n";
#fi
#
## removing dist
#if $ISWIN;
#then rmdir /s /q dist;
#else rm -rf dist/
#fi
#
## yarn build
#if $PROD;
#then echo"YARN BUILD:SSR";yarn build:ssr;
#else echo"YARN BUILD:DEV-SSR";yarn build:dev-ssr;
#fi

# building functions
cd functions && npm run build;
echo "Functions prebuilt";
# functions deployment
firebase deploy --only functions > deployment_log.txt;
echo "First deploy of functions succesfully"
while true;
do
COUNT=$(grep -E "firebase deploy --only " deployment_log.txt);
  if [[ $COUNT = '' ]];
  then echo "All functions is deployed";break;
  else echo -e "This functions was undeployed:\n$COUNT\n\n Try to redeploying...\n\n";
#  echo "Running ${COUNT//[1m/''}&> deployment_log.txt";
  ${COUNT//[1m/''} > deployment_log.txt;
  fi
done

## deleting index.html
cd ../dist/browser || exit;
if $ISWIN;
then del /q index.html;
else rm index.html;
fi
echo -e "\n\nIndex.html removed\n\n";

# if everything is fine - deleting log
if $ISWIN;
then cd ../functions && del /q deployment_log.txt;
else cd ../functions && rm deployment_log.txt;
fi
echo -e "\n\nLogs removed\n\n";

# deploying hosting
firebase deploy --only hosting;
echo -e "\n\Hosting deployed\n\n";

echo "Done"
