---
layout: post
title: I wrote a Python Library!
---

So I have been working on a Django project for about 4 months now. Few days back while working on the project I faced some challenges. The project requirement was to read from a table which had some websites and their credentials. I would have to perform some CRUD operations on each of those as and when required to do so. But the issue was the databases were only accessible by ssh. 

Thus began my hunt for finding ways to do so. Things would have been easier if those databases had been static as Django provides a way to connect to remote databases via ssh tunnel. But in my case the databases being dynamic made my task difficult. There are ways to connect to remote dbs via ssh, however I could not find a way that was clean or pythonic. 

Hence I wrote: `django-ssh-tunnel-database-connector`

This library helps to perform CRUD operations in remote dbs without you having to write a single sql statement. 

A detailed documentation of this library can be found at the github page: [Github Link](https://github.com/Arnie09/DjangoSSHTunnelDatabaseConnector)
