# ResponseUserProfilesVoidSubscriptionInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_void_subscription_internal import ResponseUserProfilesVoidSubscriptionInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesVoidSubscriptionInternal from a JSON string
response_user_profiles_void_subscription_internal_instance = ResponseUserProfilesVoidSubscriptionInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesVoidSubscriptionInternal.to_json())

# convert the object into a dict
response_user_profiles_void_subscription_internal_dict = response_user_profiles_void_subscription_internal_instance.to_dict()
# create an instance of ResponseUserProfilesVoidSubscriptionInternal from a dict
response_user_profiles_void_subscription_internal_from_dict = ResponseUserProfilesVoidSubscriptionInternal.from_dict(response_user_profiles_void_subscription_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


