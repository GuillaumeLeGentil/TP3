
FROM ubuntu


#	PART 1

# Update + lib
RUN apt-get update && apt-get install -y \ 
	curl libxext-dev libxrender-dev libxtst-dev unzip wget \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /tmp/*


# Variables pour faciliter les commandes RUN
ENV NETBEANS_URL=http://download.oracle.com/otn-pub/java/jdk-nb/7u80-8.0.2/jdk-7u80-nb-8_0_2-linux-x64.sh
ENV POLICY_URL=http://download.oracle.com/otn-pub/java/jce/7/UnlimitedJCEPolicyJDK7.zip
ENV COOKIE="Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie"

# Télécharger le jdk et le jre(NetBeans 8.0.2 + JDK 1.7u80)
RUN wget --progress=bar:force $NETBEANS_URL -O /tmp/netbeans.sh \
        --no-cookies --no-check-certificate --header "$COOKIE" \
        && echo "Installing NetBeans $NETBEANS_VERSION..." \
        && chmod +x /tmp/netbeans.sh; sleep 1 \
        && /tmp/netbeans.sh --silent \
        && rm -rf /tmp/* \
        && ln -s $(ls -d /usr/local/netbeans-*) /usr/local/netbeans

# Télécharger et installer la politique de sécuritée 
RUN curl -L $POLICY_URL -o /tmp/policy.zip \
		--cookie 'oraclelicense=accept-securebackup-cookie;' \
	&& JAVA_HOME=$(ls -d /usr/local/jdk1.*) \
        && unzip -j -o /tmp/policy.zip -d $JAVA_HOME/jre/lib/security \
	&& rm /tmp/policy.zip

#Dans l'optique de lancer netbeans, cependant j'ai une erreur sur la variable d'environement 
# DISPLAY que j'ai placé à $DISPLAY vue dans le TP1. 


#Error: Can't connect to X11 window server using ':0' as the value of the DISPLAY variable.
CMD /usr/local/netbeans/bin/netbeans -D FOREGROUND 



