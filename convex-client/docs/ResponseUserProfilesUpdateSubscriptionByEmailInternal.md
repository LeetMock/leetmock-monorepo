# ResponseUserProfilesUpdateSubscriptionByEmailInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_user_profiles_update_subscription_by_email_internal import ResponseUserProfilesUpdateSubscriptionByEmailInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseUserProfilesUpdateSubscriptionByEmailInternal from a JSON string
response_user_profiles_update_subscription_by_email_internal_instance = ResponseUserProfilesUpdateSubscriptionByEmailInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseUserProfilesUpdateSubscriptionByEmailInternal.to_json())

# convert the object into a dict
response_user_profiles_update_subscription_by_email_internal_dict = response_user_profiles_update_subscription_by_email_internal_instance.to_dict()
# create an instance of ResponseUserProfilesUpdateSubscriptionByEmailInternal from a dict
response_user_profiles_update_subscription_by_email_internal_from_dict = ResponseUserProfilesUpdateSubscriptionByEmailInternal.from_dict(response_user_profiles_update_subscription_by_email_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


