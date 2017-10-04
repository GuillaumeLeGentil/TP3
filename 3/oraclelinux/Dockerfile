# Serveur appache de base 

FROM oraclelinux:7 

MAINTAINER Guillaume <guillaume.legoallec@gmail.com> 

RUN yum install -y httpd perl && yum clean all 

EXPOSE 8080 

CMD /usr/sbin/httpd -D FOREGROUND 


