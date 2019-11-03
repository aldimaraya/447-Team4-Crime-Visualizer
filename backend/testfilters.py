from requests import post 
import json
# these tests will break when the database updates

url = "http://127.0.0.1:5000/db/filter/"
filters1 = {
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

filters2 = {
    "crime": {
        'longitude': {'is': [-76.6912968198]},
        'latitude':{ 'is': [39.289581962]}, 
    }
}

filters3 = {
    "crime":{
        "total_incidents": {'before': '1=1'}
    }
}

filters4 = {
    "realestate": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

filters5 = {
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

filters6 = {
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    },
    "realestate": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

# test 1
print("test 1")
r = post(url = url, json = filters1)
data = r.json()
assert(len(data) == 1)
assert(len(data['crime']) == 27982)
print("test 1 completed")


# test 2
print("test 2")
r = post(url = url, json = filters2)
data = r.json()
assert(len(data['crime']) == 1)
print("test 2 completed")

# test 3
print("test 3")
r = post(url = url, json = filters3)
data = r.json()
assert(len(data['crime']) == 280826)
print("test 3 completed")

# test 4
print("test 4")
r = post(url = url, json = filters4)
data = r.json()
assert(len(data['realestate']) == 17)
print("test 4 completed")

# test 5
print("test 5")
r = post(url = url, json = filters5)
data = r.json()
assert(len(data['crime']) == 27982)
print("test 5 completed")


# test 6
print("test 6")
r = post(url = url, json = filters6)
data = r.json()
with open('test6.json', 'w') as f:
    json.dump(data, f)
assert(len(data['realestate']) == 17)
assert(len(data['crime']) == 27982)
print("test 6 completed")


filters7a = {
    "realestate": {
        'longitude': {'before': 0, 'after':-100.0}
    }
}
filters7b = {
    "realestate": {
        'latitude': {'after': 0}
    }
}
print("test 7")
r = post(url = url, json = filters7a)
data = r.json()
print(len(data['realestate']))
r = post(url = url, json = filters7b)
data = r.json()
print(len(data['realestate']))
print("test 7 completed")


filters8 = {
    "realestate": {
        'uid': {'after': 0}
    }
}

print("test 8")
r = post(url = url, json = filters8)
data = r.json()
print(len(data['realestate']))
print("test 8 completed")

filters9 = {
    "realestate": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    },
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}
print("test 9")
r = post(url = url, json = filters9)
data = r.json()
print(len(data['realestate']), len(data['crime']))
print("test 9 completed")


