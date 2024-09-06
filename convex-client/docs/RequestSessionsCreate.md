# RequestSessionsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsCreateArgs**](RequestSessionsCreateArgs.md) |  | 

## Example

```python
from convex_client.models.request_sessions_create import RequestSessionsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsCreate from a JSON string
request_sessions_create_instance = RequestSessionsCreate.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsCreate.to_json())

# convert the object into a dict
request_sessions_create_dict = request_sessions_create_instance.to_dict()
# create an instance of RequestSessionsCreate from a dict
request_sessions_create_from_dict = RequestSessionsCreate.from_dict(request_sessions_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


