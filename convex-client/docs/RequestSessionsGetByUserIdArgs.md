# RequestSessionsGetByUserIdArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user_id** | **str** |  | 

## Example

```python
from convex_client.models.request_sessions_get_by_user_id_args import RequestSessionsGetByUserIdArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsGetByUserIdArgs from a JSON string
request_sessions_get_by_user_id_args_instance = RequestSessionsGetByUserIdArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsGetByUserIdArgs.to_json())

# convert the object into a dict
request_sessions_get_by_user_id_args_dict = request_sessions_get_by_user_id_args_instance.to_dict()
# create an instance of RequestSessionsGetByUserIdArgs from a dict
request_sessions_get_by_user_id_args_from_dict = RequestSessionsGetByUserIdArgs.from_dict(request_sessions_get_by_user_id_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


