# ResponseActionsGetToken


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_actions_get_token import ResponseActionsGetToken

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGetToken from a JSON string
response_actions_get_token_instance = ResponseActionsGetToken.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGetToken.to_json())

# convert the object into a dict
response_actions_get_token_dict = response_actions_get_token_instance.to_dict()
# create an instance of ResponseActionsGetToken from a dict
response_actions_get_token_from_dict = ResponseActionsGetToken.from_dict(response_actions_get_token_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


