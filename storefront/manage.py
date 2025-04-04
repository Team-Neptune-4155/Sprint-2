#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import mysql.connector
import json


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'storefront.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)



def initDB():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="32011509",
        database="roommatedb"
    )


    mycursor = mydb.cursor()

    mycursor.execute("DROP TABLE schedules")
    mycursor.execute("DROP TABLE rooms")
    mycursor.execute("CREATE TABLE `rooms` (`id` varchar(100) NOT NULL,`roomNum` int NOT NULL,`building` varchar(100) NOT NULL, `capacity` int DEFAULT NULL, `studyType` varchar(100) DEFAULT NULL, `description` varchar(100) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `roomNum` (`roomNum`,`building`), UNIQUE KEY `id_UNIQUE` (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; ")
    mycursor.execute("CREATE TABLE `schedules` (`id` int NOT NULL AUTO_INCREMENT, `room` int NOT NULL, `course_name` varchar(200) NOT NULL, `instructor` varchar(100) DEFAULT NULL, `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL, `start_time` time NOT NULL, `end_time` time NOT NULL, PRIMARY KEY (`id`), KEY `room` (`room`), CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`room`) REFERENCES `rooms` (`roomNum`) ON DELETE CASCADE) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")

    mycursor.execute("INSERT INTO `roommatedb`.`rooms`(`id`,`roomNum`,`building`,`capacity`,`studytype`, `description`) VALUES ('WW155', 155, 'Woodward', 75, 'Active Learning', 'example');")
    mycursor.execute("INSERT INTO `roommatedb`.`schedules`(`id`,`room`, `course_name`, `instructor`, `day_of_week`, `start_time`, `end_time`) VALUES (1, 155, 'Intro to Game Design & Dvlpmnt', 'Bahamon, Julio Cesar', 'Monday','8:00:00','8:50:00');")

    mycursor.execute("SELECT * FROM rooms")

    myresult = mycursor.fetchall()

    with open('static/rooms.json', 'w', encoding='utf-8') as f:
        json.dump(myresult, f, ensure_ascii=False, indent=4)

    for x in myresult:
        print(x)

if __name__ == '__main__':
    initDB()
    main()


