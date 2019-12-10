from requests import post 
import json
# these tests will break when the database updates

url = "http://127.0.0.1:5000/db/filter/"
# Test before
filters1 = {
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

# test 1
print("test 1")
r = post(url = url, json = filters1)
data = r.json()
with open('test1.json', 'w') as f:
    json.dump(data, f)
# assert only 1 table returns
assert(len(data) == 1)
# assert the data exists
assert(len(data['crime']) > 0)
print("test 1 completed")

# Test is
filters2 = {
    "crime": {
        'longitude': {'is': [-76.682186204706]},
        'latitude':{ 'is': [39.284461609954]}, 
    }
}

# test 2
print("test 2")
r = post(url = url, json = filters2)
data = r.json()
with open('test2.json', 'w') as f:
    json.dump(data, f)
# assert data exists, which it should
assert(len(data['crime']) > 0)
print("test 2 completed")

# Test SQL injection for before
filters3 = {
    "crime":{
        "total_incidents": {'before': '1=1'}
    }
}

# test 3
print("test 3")
r = post(url = url, json = filters3)
data = r.json()
with open('test3.json', 'w') as f:
    json.dump(data, f)
# assert data exists
assert(len(data['crime']) > 1)
print("test 3 completed")

# test invalid keys
filters4 = {
    "realestate": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}
# test 4
print("test 4")
r = post(url = url, json = filters4)
data = r.json()
with open('test4.json', 'w') as f:
    json.dump(data, f)
# assert an error was thrown
assert(data['error'] == "Invalid table key: longitude")
print("test 4 completed")

# test invalid key values
filters5 = {
    "crime": {
        'longitude': {'before2': -76.65063667398547},
        'latitude': {'asfge': 39.30610364364959}
    }
}

# test 5
print("test 5")
r = post(url = url, json = filters5)
data = r.json()
with open('test5.json', 'w') as f:
    json.dump(data, f)
# assert an error was thrown
assert(data['error'] != None)
print("test 5 completed")


# Test multiple table queries in a single request
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

# test 6
print("test 6")
r = post(url = url, json = filters6)
data = r.json()
with open('test6.json', 'w') as f:
    json.dump(data, f)
# assert an error was thrown
assert(data['error'] == "Invalid table key: longitude")
print("test 6 completed")


# test odd values, should return no rows
filters7a = {
    "realestate": {
        'est_value': {'before': -1, 'after':-100.0}
    }
}
# test valid values
filters7b = {
    "realestate": {
        'est_value': {'after': 1000000}
    }
}
print("test 7")
r = post(url = url, json = filters7a)
data = r.json()
with open('test7a.json', 'w') as f:
    json.dump(data, f)
# assert no rows returned, if there was then its the data's fault lol
assert(len(data['realestate']) == 0)
r = post(url = url, json = filters7b)
data = r.json()
with open('test7b.json', 'w') as f:
    json.dump(data, f)
# assert the data exists
assert(len(data['realestate']) > 0)
print("test 7 completed")


# test size limitations by requesting all
filters8 = {
    "realestate": {
        'uid': {'after': 0}
    }
}

print("test 8")
r = post(url = url, json = filters8)
data = r.json()
with open('test8.json', 'w') as f:
    json.dump(data, f)
# assert data exists
assert(len(data['realestate']) > 0)
print("test 8 completed")

# additional full testing
filters9 = {
    "realestate": {
        'addr_num': {'before': 2000},
    },
    "crime": {
        'longitude': {'before': -76.65063667398547},
        'latitude': {'before': 39.30610364364959}
    }
}

print("test 9")
r = post(url = url, json = filters9)
data = r.json()
with open('test9.json', 'w') as f:
    json.dump(data, f)
# assert data exists
assert(len(data['realestate']) > 0)
assert(len(data['crime']) > 0)
print("test 9 completed")

print("COMPLETED TESTS")
