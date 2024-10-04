# ResponseAdminsPatchUserSubscription


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_admins_patch_user_subscription import ResponseAdminsPatchUserSubscription

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseAdminsPatchUserSubscription from a JSON string
response_admins_patch_user_subscription_instance = ResponseAdminsPatchUserSubscription.from_json(json)
# print the JSON string representation of the object
print(ResponseAdminsPatchUserSubscription.to_json())

# convert the object into a dict
response_admins_patch_user_subscription_dict = response_admins_patch_user_subscription_instance.to_dict()
# create an instance of ResponseAdminsPatchUserSubscription from a dict
response_admins_patch_user_subscription_from_dict = ResponseAdminsPatchUserSubscription.from_dict(response_admins_patch_user_subscription_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


