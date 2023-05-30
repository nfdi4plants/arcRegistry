FROM express-gateway
RUN yarn global add express-gateway-plugin-rewrite
COPY ./config/ /var/lib/eg/
EXPOSE 8080 9876
CMD ["node", "-e", "require('express-gateway')().run();"]