# ResponseSessionsExists


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_exists import ResponseSessionsExists

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsExists from a JSON string
response_sessions_exists_instance = ResponseSessionsExists.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsExists.to_json())

# convert the object into a dict
response_sessions_exists_dict = response_sessions_exists_instance.to_dict()
# create an instance of ResponseSessionsExists from a dict
response_sessions_exists_from_dict = ResponseSessionsExists.from_dict(response_sessions_exists_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


