# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 216.15.29.240 (MySQL 5.7.18-0ubuntu0.17.04.1)
# Database: nowplaying
# Generation Time: 2018-03-30 15:27:15 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table posts
# ------------------------------------------------------------

CREATE DATABASE 'nowplaying';
USE 'nowplaying';

CREATE TABLE `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author` varchar(20) NOT NULL DEFAULT '',
  `permlink` varchar(500) NOT NULL DEFAULT '',
  `tag` varchar(20) DEFAULT NULL,
  `scraped` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created` timestamp NULL DEFAULT NULL,
  `votes` int(11) NOT NULL DEFAULT '0',
  `did_vote` tinyint(4) NOT NULL DEFAULT '0',
  `did_comment` tinyint(4) NOT NULL DEFAULT '0',
  `is_approved` tinyint(4) NOT NULL DEFAULT '0',
  `children` int(11) DEFAULT NULL,
  `read_replies` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `author` (`author`,`permlink`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table spotifyRef
# ------------------------------------------------------------

CREATE TABLE `spotifyRef` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `postId` int(11) NOT NULL,
  `artistId` int(11) NOT NULL,
  `songId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tracks
# ------------------------------------------------------------

CREATE TABLE `tracks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `spotify_id` varchar(200) NOT NULL DEFAULT '',
  `img` varchar(1000) DEFAULT NULL,
  `name` varchar(200) NOT NULL DEFAULT '',
  `artists` varchar(200) NOT NULL DEFAULT '',
  `postId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table users
# ------------------------------------------------------------

CREATE TABLE `users` (
  `username` varchar(100) NOT NULL DEFAULT '',
  `xp` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table weeks
# ------------------------------------------------------------

CREATE TABLE `weeks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `payout` float DEFAULT NULL,
  `startWeek` tinyint(4) NOT NULL DEFAULT '0',
  `recap` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
