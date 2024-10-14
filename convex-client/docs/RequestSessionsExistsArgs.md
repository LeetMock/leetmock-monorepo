# RequestSessionsExistsArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**session_id** | **str** |  | 

## Example

```python
from convex_client.models.request_sessions_exists_args import RequestSessionsExistsArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsExistsArgs from a JSON string
request_sessions_exists_args_instance = RequestSessionsExistsArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsExistsArgs.to_json())

# convert the object into a dict
request_sessions_exists_args_dict = request_sessions_exists_args_instance.to_dict()
# create an instance of RequestSessionsExistsArgs from a dict
request_sessions_exists_args_from_dict = RequestSessionsExistsArgs.from_dict(request_sessions_exists_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


