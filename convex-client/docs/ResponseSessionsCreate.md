# ResponseSessionsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_create import ResponseSessionsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsCreate from a JSON string
response_sessions_create_instance = ResponseSessionsCreate.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsCreate.to_json())

# convert the object into a dict
response_sessions_create_dict = response_sessions_create_instance.to_dict()
# create an instance of ResponseSessionsCreate from a dict
response_sessions_create_from_dict = ResponseSessionsCreate.from_dict(response_sessions_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


