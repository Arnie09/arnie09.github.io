---
layout: post
title: "I wrote a python library!"
date: 2023-06-10 10:00:00 +0000
categories: [web-development, django, python]
tags: [django, python, pip]
---

So I have been working on a Django project for about 4 months now. A few days back while working on the project I faced some challenges. The project requirement was to read from a table that had some websites and their credentials. I would have to perform some CRUD operations on each of those as and when required to do so. But the issue was the databases were only accessible by ssh.

Thus began my hunt for finding ways to do so. Things would have been easier if those databases had been static as Django provides a way to connect to remote databases via ssh tunnel. But in my case the databases being dynamic made my task difficult. There are ways to connect to remote dbs via ssh, however, I could not find a way that was clean or Pythonic.

Hence I wrote: django-ssh-tunnel-database-connector

This library helps to perform CRUD operations in remote DBS without you having to write a single SQL statement.

Detailed documentation of this library can be found on the GitHub page: https://github.com/Arnie09/DjangoSSHTunnelDatabaseConnector
