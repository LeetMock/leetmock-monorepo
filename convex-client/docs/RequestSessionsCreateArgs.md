# RequestSessionsCreateArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**agent_thread_id** | **str** |  | 
**assistant_id** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_sessions_create_args import RequestSessionsCreateArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsCreateArgs from a JSON string
request_sessions_create_args_instance = RequestSessionsCreateArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsCreateArgs.to_json())

# convert the object into a dict
request_sessions_create_args_dict = request_sessions_create_args_instance.to_dict()
# create an instance of RequestSessionsCreateArgs from a dict
request_sessions_create_args_from_dict = RequestSessionsCreateArgs.from_dict(request_sessions_create_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


